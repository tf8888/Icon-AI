import { NextResponse } from "next/server";
import { VapiClient } from "@vapi-ai/server-sdk";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Authenticate user with Clerk
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.VAPI_API_KEY;
  if (!token) {
    return NextResponse.json(
      { error: "Server misconfiguration: VAPI_API_KEY is not set." },
      { status: 500 }
    );
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase configuration missing" },
      { status: 500 }
    );
  }

  const client = new VapiClient({ token });
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Get user credentials from the request body or database
  let bearer = body.ghl_pit_token;
  let locationId = body.ghl_location_id || body.locationId;
  let phoneNumberId = body.vapi_phone_number_id;
  let customerNumber = body.vapi_phone_number;

  // If user_id is provided but no credentials, fetch from database
  // Use the authenticated userId from Clerk instead of trusting the request body
  if (!bearer || !locationId || !phoneNumberId) {
    try {
      const { data: profile, error } = await supabase
        .from("profile")
        .select(
          "ghl_pit_token, ghl_location_id, vapi_phone_number_id, vapi_phone_number, phone_number"
        )
        .eq("user_id", userId) // Use authenticated userId from Clerk
        .single();

      if (error) {
        return NextResponse.json(
          { error: "Failed to fetch user profile: " + error.message },
          { status: 400 }
        );
      }

      if (!profile) {
        return NextResponse.json(
          { error: "User profile not found" },
          { status: 404 }
        );
      }

      bearer = bearer || profile.ghl_pit_token;
      locationId = locationId || profile.ghl_location_id;
      phoneNumberId = phoneNumberId || profile.vapi_phone_number_id;
      customerNumber = customerNumber || profile.phone_number;
    } catch (error) {
      return NextResponse.json(
        {
          error:
            "Database error: " +
            (error instanceof Error ? error.message : String(error)),
        },
        { status: 500 }
      );
    }
  }

  // Fallback to environment variables if still not available
  bearer = bearer || process.env.GHL_PIT;
  phoneNumberId = phoneNumberId || process.env.VAPI_PHONE_NUMBER_ID;
  customerNumber = customerNumber || process.env.CUSTOMER_PHONE_NUMBER;

  if (!bearer) {
    return NextResponse.json(
      { error: "GHL PIT token not found in request or environment" },
      { status: 400 }
    );
  }

  if (!phoneNumberId) {
    return NextResponse.json(
      { error: "VAPI phone number ID not found in request or environment" },
      { status: 400 }
    );
  }

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

    const instructions:
      | string
      | undefined = `Your job is to provide the user with a summary of their business and help them with their GoHighLevel tasks. Their location id is ${locationId} use this for all tool calls. This is a ${
      body.callType || "checkup"
    } call to update them on their business progress.`;
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
        model: "gpt-4", // Changed from gpt-5 to gpt-4 as it's more commonly available
        toolIds: [tool.id],
        messages: mergedMessages,
      },
    } as any;

    console.log("assistant payload: ", assistantPayload);
    const assistant = await client.assistants.create(assistantPayload);
    console.log("assistant created: ", assistant);

    // Extract phone number from SIP URI if needed
    let callToNumber = customerNumber;
    if (customerNumber && customerNumber.startsWith("sip:")) {
      // For SIP URIs, we might need to handle differently or use a different number
      // For now, we'll use the environment variable as fallback
      callToNumber = process.env.CUSTOMER_PHONE_NUMBER;
    }

    const call = await client.calls.create({
      assistantId: assistant.id,
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
      customer: { number: callToNumber },
    });
    console.log("call created: ", call);

    return NextResponse.json(assistant);
  } catch (err: any) {
    console.error("Failed to create assistant: ", err);

    const status = err?.statusCode || 500;
    const message = err?.message || "Failed to create assistant";
    const details = err?.body || err?.response?.data || undefined;
    return NextResponse.json({ error: message, details }, { status });
  }
}
