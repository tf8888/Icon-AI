import { NextResponse } from "next/server";
import { VapiClient } from "@vapi-ai/server-sdk";
import { createAssistantWithTools } from "@/lib/vapiAssistant";

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

  // Resolve credentials from request or env
  let bearer = body.ghl_pit_token || process.env.GHL_PIT;
  let locationId = body.ghl_location_id || body.locationId;

  if (!bearer) {
    return NextResponse.json(
      { error: "GHL PIT token not found in request or environment" },
      { status: 400 }
    );
  }

  try {
    const messagesFromBody = Array.isArray(body?.model?.messages)
      ? body.model.messages
      : [];

    // Whitelist only allowed assistant properties to avoid schema errors
    const assistantOverrides: any = {};
    if (body && typeof body === "object") {
      if (typeof body.name === "string") assistantOverrides.name = body.name;
      if (typeof body.recordingEnabled === "boolean") assistantOverrides.recordingEnabled = body.recordingEnabled;
      if (body.voice && typeof body.voice === "object") assistantOverrides.voice = body.voice;
      if (body.transcriber && typeof body.transcriber === "object") assistantOverrides.transcriber = body.transcriber;
      if (body.toolDefaults && typeof body.toolDefaults === "object") assistantOverrides.toolDefaults = body.toolDefaults;
      if (body.variableValues && typeof body.variableValues === "object") assistantOverrides.variableValues = body.variableValues;
      if (body.model && typeof body.model === "object") assistantOverrides.model = body.model;
    }

    const { assistant } = await createAssistantWithTools({
      client,
      bearer,
      locationId,
      callType: body.callType || "checkup",
      modelMessages: messagesFromBody,
      assistantOverrides,
    });

    return NextResponse.json(assistant);
  } catch (err: any) {
    const status = err?.statusCode || 500;
    const message = err?.message || "Failed to create assistant";
    const details = err?.body || err?.response?.data || undefined;
    return NextResponse.json({ error: message, details }, { status });
  }
}


