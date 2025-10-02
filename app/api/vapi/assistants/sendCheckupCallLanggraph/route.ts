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
        console.error("Error fetching user profile: ", error);
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

  // Get the base URL for our endpoints
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";

  try {
    // Create a function tool that calls our Langgraph agent
    const toolPayload: any = {
      type: "function",
      function: {
        name: "langgraph_business_agent",
        description:
          "Get comprehensive business analysis and insights using advanced Langgraph agent technology that intelligently uses multiple GoHighLevel tools",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "The business question or request for analysis (e.g., 'give me a comprehensive business update', 'analyze my sales pipeline', 'show me lead conversion metrics')",
            },
            // focus_areas: {
            //   type: "array",
            //   items: {
            //     type: "string",
            //     enum: [
            //       "calendars_get-calendar-events",
            //       "calendars_get-appointment-notes",
            //       "contacts_get-all-tasks",
            //       "contacts_add-tags",
            //       "contacts_remove-tags",
            //       "contacts_get-contact",
            //       "contacts_update-contact",
            //       "contacts_upsert-contact",
            //       "contacts_create-contact",
            //       "contacts_get-contacts",
            //       "conversations_search-conversation",
            //       "conversations_get-messages",
            //       "conversations_send-a-new-message",
            //       "locations_get-location",
            //       "locations_get-custom-fields",
            //       "opportunities_search-opportunity",
            //       "opportunities_get-pipelines",
            //       "opportunities_get-opportunity",
            //       "opportunities_update-opportunity",
            //       "payments_get-order-by-id",
            //       "payments_list-transactions",
            //     ],
            //   },
            //   description:
            //     "Specific areas to focus the analysis on. Use 'comprehensive' for full business overview.",
            //   default: ["comprehensive"],
            // },
          },
          required: ["query"],
        },
      },
      server: {
        url: `${baseUrl}/api/vapi/tools/langgraph-business-agent`,
        timeoutSeconds: 30,
        headers: {
          Authorization: bearer,
          locationId: locationId,
        },
      },
    };

    const tool = await client.tools.create(toolPayload);
    console.log("Langgraph business agent tool created: ", tool);

    const instructions: string = `You are an advanced AI business assistant powered by Langgraph agent technology, specializing in GoHighLevel CRM management. You have access to an intelligent business analysis tool that can automatically gather and analyze comprehensive business data.

CORE CAPABILITIES:
- Advanced business intelligence through automated tool orchestration
- Real-time data analysis from multiple GoHighLevel systems
- Intelligent pattern recognition and trend identification
- Strategic recommendations based on comprehensive data analysis
- Lead optimization and conversion improvement strategies

TOOL USAGE STRATEGY:
- Use the langgraph_business_agent tool for ANY business-related questions
- This tool automatically handles multiple MCP tool calls internally
- It provides analyzed insights, not just raw data
- Always pass the user's request as the 'query' parameter
- Use focus_areas to target specific business aspects when needed

COMMUNICATION STYLE:
- Professional and executive-level insights
- Lead with key findings and actionable recommendations
- Support insights with specific data points
- Provide clear next steps and strategic guidance
- Keep responses conversational for voice interaction

This is a ${
      body.callType || "checkup"
    } call to update the user on their business progress. Use the langgraph_business_agent tool proactively to gather comprehensive business intelligence.`;

    const messagesFromBody = Array.isArray(body?.model?.messages)
      ? body.model.messages
      : [];

    const mergedMessages = instructions
      ? [
          { role: "system", content: instructions },
          {
            role: "user",
            content:
              "Give me a comprehensive business update using the langgraph agent. " +
              JSON.stringify(body),
          },
          ...messagesFromBody,
        ]
      : messagesFromBody;

    const webhookUrl = `${baseUrl}/api/vapi/webhooks`;

    const assistantPayload = {
      ...(body ?? {}),
      name: "GHL-Langgraph-Business-Assistant",
      model: {
        provider: "openai",
        model: "gpt-4o",
        temperature: 0.5,
        messages: [
          {
            role: "system",
            content: `You are an advanced AI business assistant powered by Langgraph agent technology, specializing in GoHighLevel CRM management. You have access to a powerful langgraph_business_agent tool that performs intelligent business analysis.

INTELLIGENT AGENT BEHAVIOR:
- Use the langgraph_business_agent tool for comprehensive business analysis
- This tool automatically orchestrates multiple data gathering operations
- It provides analyzed insights and strategic recommendations
- Think strategically about what business intelligence the user needs

TOOL USAGE:
- Always use langgraph_business_agent for business queries
- Pass clear, specific queries to get targeted insights
- Use focus_areas parameter to target specific business aspects
- The tool handles all complexity internally and returns actionable insights

EXECUTION STRATEGY:
1. For "business updates": Use comprehensive focus areas
2. For specific questions: Target relevant focus areas  
3. Always analyze tool results and provide strategic guidance
4. Translate technical data into business insights

RESPONSE FORMAT:
- Lead with executive summary and key insights
- Provide specific recommendations and action items
- Support with relevant data points
- End with clear next steps
- Keep responses conversational for voice interaction

Location ID for reference: ${locationId}
This is a checkup call - provide comprehensive business intelligence and strategic guidance.`,
          },
        ],
        toolIds: [tool.id],
      },
      voice: {
        provider: "11labs",
        voiceId: "paula",
      },
      firstMessage: `Hello! I'm your intelligent GoHighLevel business assistant powered by advanced Langgraph technology. I can automatically analyze your business data across multiple systems to provide comprehensive insights. Let me immediately use my advanced analysis capabilities to gather your latest business metrics and provide strategic recommendations.`,

      // Configure server messages to include end-of-call-report
      serverMessages: ["end-of-call-report"],
      // Configure server URL for webhooks
      server: {
        url: webhookUrl,
        timeoutSeconds: 20,
      },
      analysisPlan: {
        summaryPrompt:
          "You are an expert note-taker and business analyst. Summarize this GoHighLevel checkup call in 2-3 sentences, focusing on key business insights, customer concerns, and actionable next steps. Include any metrics discussed and strategic recommendations made by the Langgraph agent.",
        structuredDataPrompt:
          "You are an expert data extractor. Extract structured data from this call per the schema, focusing on business performance metrics and strategic outcomes.",
        structuredDataSchema: {
          type: "object",
          properties: {
            callSummary: {
              type: "string",
              description: "Brief summary of the call in 2-3 sentences",
            },
            customerConcerns: {
              type: "array",
              items: { type: "string" },
              description: "List of customer concerns or issues discussed",
            },
            followUpActions: {
              type: "array",
              items: { type: "string" },
              description: "Required follow-up actions",
            },
            businessMetrics: {
              type: "object",
              properties: {
                contactsCount: { type: "number" },
                opportunitiesCount: { type: "number" },
                totalValue: { type: "number" },
              },
              description: "Key business metrics discussed",
            },
            strategicRecommendations: {
              type: "array",
              items: { type: "string" },
              description:
                "Strategic recommendations provided by Langgraph agent",
            },
            callOutcome: {
              type: "string",
              description: "Overall outcome of the call",
            },
            customerSatisfaction: {
              type: "string",
              enum: ["satisfied", "neutral", "dissatisfied", "unknown"],
              description: "Customer satisfaction level",
            },
            insightsProvided: {
              type: "array",
              items: { type: "string" },
              description: "Key business insights and recommendations provided",
            },
          },
          required: ["callSummary", "callOutcome"],
        },
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

    return NextResponse.json({
      ...assistant,
      langgraphAgent: {
        enabled: true,
        approach: "function-tool-integration",
        toolId: tool.id,
        capabilities: "full-langgraph-orchestration",
      },
    });
  } catch (err: any) {
    console.error("Failed to create assistant: ", err);

    const status = err?.statusCode || 500;
    const message = err?.message || "Failed to create assistant";
    const details = err?.body || err?.response?.data || undefined;
    return NextResponse.json({ error: message, details }, { status });
  }
}
