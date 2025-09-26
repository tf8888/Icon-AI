import { NextResponse } from "next/server";
import { VapiClient } from "@vapi-ai/server-sdk";
import { createAssistantWithTools } from "@/lib/vapiAssistant";
import supabase from "@/lib/supabaseClient";

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

  // Get user credentials from the request body or database
  let bearer = body.ghl_pit_token;
  let locationId = body.ghl_location_id || body.locationId;
  let phoneNumberId = body.vapi_phone_number_id;
  let customerNumber = body.vapi_phone_number;

  // If user_id is provided but no credentials, fetch from database
  if (body.user_id && (!bearer || !locationId || !phoneNumberId)) {
    try {
      const { data: profile, error } = await supabase
        .from("profile")
        .select(
          "ghl_pit_token, ghl_location_id, vapi_phone_number_id, vapi_phone_number, phone_number"
        )
        .eq("user_id", body.user_id)
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

  try {
    const messagesFromBody = Array.isArray(body?.model?.messages)
      ? body.model.messages
      : [];

    // Whitelist assistant overrides to avoid invalid props
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
      modelMessages: [
        {
          role: "user",
          content:
            "Give me an update based on this snapshot: " +
            JSON.stringify(body),
        },
        ...messagesFromBody,
      ],
      assistantOverrides,
    });
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
      phoneNumberId: phoneNumberId,
      customer: { number: callToNumber },
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
