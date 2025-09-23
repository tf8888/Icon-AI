import { NextResponse } from "next/server";
import { VapiClient } from "@vapi-ai/server-sdk";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const token = process.env.VAPI_API_KEY;
  if (!token) {
    return NextResponse.json(
      { error: "Server misconfiguration: VAPI_API_KEY is not set." },
      { status: 500 }
    );
  }

  const client = new VapiClient({ token });

  // TODO: these will be hashed in production passed in the body as accessId
  const bearer = process.env.GHL_PIT;
  const serverUrl = "https://services.leadconnectorhq.com/mcp/";

  try {
    const toolPayload: any = {
      type: "mcp",
      server: {
        url: serverUrl,
        headers: {
          Authorization: `Bearer ${bearer}`,
          locationId: body.locationId,
        },
      },
      metadata: {
        protocol: "shttp",
      },
    };
    const tool = await client.tools.create(toolPayload);
    console.log("tool created: ", tool);

    const instructions: string | undefined =
      "Your job is to provide the user with a summary of their business and help them with their GoHighLevel tasks. Their location id is DEpaQZQPhVVktU4FZci7 use this for all tool calls.";
    const messagesFromBody = Array.isArray(body?.model?.messages)
      ? body.model.messages
      : [];
    const mergedMessages = instructions
      ? [
          { role: "system", content: instructions },
          {
            role: "user",
            content:
              "Give me an update based on this snapshot: " +
              JSON.stringify(body),
          },
          ...messagesFromBody,
        ]
      : messagesFromBody;

    const assistantPayload = {
      ...(body ?? {}),
      model: {
        ...body.model,
        provider: "openai",
        model: "gpt-5",
        toolIds: [tool.id],
        messages: mergedMessages,
      },
    } as any;

    console.log("assistant payload: ", assistantPayload);
    const assistant = await client.assistants.create(assistantPayload);
    console.log("assistant created: ", assistant);

    const call = await client.calls.create({
      assistantId: assistant.id,
      phoneNumberId: "b7525c7c-eed5-4da9-8cf4-3b89d0cabcc5",
      customer: { number: process.env.CUSTOMER_PHONE_NUMBER },
    });
    console.log("call created: ", call);

    return NextResponse.json(assistant);
  } catch (err: any) {
    const status = err?.statusCode || 500;
    const message = err?.message || "Failed to create assistant";
    const details = err?.body || err?.response?.data || undefined;
    return NextResponse.json({ error: message, details }, { status });
  }
}
