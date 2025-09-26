import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

interface VapiCallEndedMessage {
  type: "end-of-call-report";
  call: {
    id: string;
    orgId: string;
    createdAt: string;
    updatedAt: string;
    type: "inboundPhoneCall" | "outboundPhoneCall" | "webCall";
    phoneCallProvider: string;
    phoneCallProviderId: string;
    phoneCallTransport: string;
    status: "queued" | "ringing" | "in-progress" | "forwarding" | "ended";
    endedReason?: string;
    messages?: Array<{
      role: "assistant" | "user" | "system";
      message: string;
      time: number;
      endTime: number;
      secondsFromStart: number;
    }>;
    transcript?: string;
    recordingUrl?: string;
    summary?: string;
    analysis?: {
      summary?: string;
      structuredData?: any;
      successEvaluation?: any;
    };
    artifact?: {
      messagesOpenAIFormatted?: any[];
      recordingUrl?: string;
      videoRecordingUrl?: string;
      stereoRecordingUrl?: string;
      transcript?: string;
    };
    customer?: {
      number?: string;
      extension?: string;
    };
    phoneNumber?: {
      id: string;
      orgId: string;
      number: string;
    };
    assistantId?: string;
    squadId?: string;
    cost?: number;
    costBreakdown?: any;
  };
  timestamp: string;
}

// Function to send data to n8n webhook with retry logic
async function sendToN8nWebhook(
  summary: string,
  customerEmail: string,
  customerNumber: string,
  callData: any,
  retryCount: number = 0
) {
  const maxRetries = 3;
  const retryDelay = 1000 * Math.pow(2, retryCount); // Exponential backoff

  try {
    const payload = {
      summary: summary,
      customerEmail: customerEmail,
      customerNumber: customerNumber,
      callId: callData.call.id,
      timestamp: callData.timestamp,
      callData: callData,
      retryAttempt: retryCount,
    };

    console.log(
      `Sending to n8n webhook (attempt ${retryCount + 1}/${maxRetries + 1}):`,
      {
        callId: callData.call.id,
        customerNumber,
        customerEmail,
        summaryLength: summary.length,
      }
    );

    const response = await fetch(N8N_WEBHOOK_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(
        `N8N webhook failed with status ${response.status}: ${response.statusText}. Response: ${errorText}`
      );
    }

    const result = await response.json();
    console.log("Successfully sent to n8n webhook:", {
      callId: callData.call.id,
      responseStatus: response.status,
      result: result,
    });
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`N8N webhook attempt ${retryCount + 1} failed:`, {
      callId: callData.call.id,
      error: errorMessage,
      customerNumber,
    });

    // Retry logic
    if (retryCount < maxRetries) {
      console.log(`Retrying in ${retryDelay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return sendToN8nWebhook(
        summary,
        customerEmail,
        customerNumber,
        callData,
        retryCount + 1
      );
    }

    // All retries failed
    console.error(
      `All ${maxRetries + 1} attempts failed for call ${callData.call.id}`,
      {
        finalError: errorMessage,
        customerNumber,
        customerEmail,
      }
    );
    throw error;
  }
}

// Function to get customer email from phone number with enhanced error handling
async function getCustomerEmailFromPhone(
  phoneNumber: string
): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase configuration missing for email lookup");
    return null;
  }

  try {
    console.log(`Looking up customer email for phone: ${phoneNumber}`);
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Clean the phone number (remove formatting)
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, "");

    // Try multiple variations of the phone number
    const phoneVariations = [
      phoneNumber, // Original format
      cleanPhone, // Cleaned format
      cleanPhone.startsWith("+1") ? cleanPhone.substring(2) : `+1${cleanPhone}`, // With/without country code
      cleanPhone.startsWith("1") ? cleanPhone.substring(1) : `1${cleanPhone}`, // With/without area code prefix
    ];

    console.log(`Trying phone variations:`, phoneVariations);

    // This is a placeholder - you'll need to adjust based on your actual database schema
    // You might have a contacts table or similar where you store customer email and phone mappings
    for (const phoneVar of phoneVariations) {
      try {
        const { data, error } = await supabase
          .from("profile") // Adjust table name as needed
          .select("email")
          .eq("phone_number", phoneVar)
          .maybeSingle(); // Use maybeSingle to avoid throwing on no results

        if (error) {
          console.warn(`Error querying phone ${phoneVar}:`, error.message);
          continue;
        }

        if (data?.email) {
          console.log(`Found email for phone ${phoneNumber}: ${data.email}`);
          return data.email;
        }
      } catch (queryError) {
        console.warn(
          `Query failed for phone variation ${phoneVar}:`,
          queryError
        );
        continue;
      }
    }

    console.log(`No email found for any phone variation of ${phoneNumber}`);
    return null;
  } catch (error) {
    console.error("Database error fetching customer email:", {
      phoneNumber,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    console.log("📞 Vapi webhook received:", {
      timestamp: new Date().toISOString(),
      messageType: body.message?.type || "unknown",
      callId: body.message?.call?.id || "unknown",
      bodyKeys: Object.keys(body),
    });

    // Validate required structure
    if (!body.message) {
      console.warn("⚠️ Webhook received without message field");
      return NextResponse.json(
        {
          success: false,
          error: "No message field in webhook body",
        },
        { status: 400 }
      );
    }

    // Check if this is an end-of-call-report message
    if (body.message?.type === "end-of-call-report") {
      const callData: VapiCallEndedMessage = body.message;

      console.log("🔍 Processing end-of-call-report:", {
        callId: callData.call.id,
        status: callData.call.status,
        endedReason: callData.call.endedReason,
        hasTranscript: !!callData.call.transcript,
        hasAnalysis: !!callData.call.analysis,
        hasSummary: !!callData.call.summary,
        messagesCount: callData.call.messages?.length || 0,
        customerNumber: callData.call.customer?.number || "unknown",
      });

      // Validate call data
      if (!callData.call.id) {
        console.error("❌ Call data missing required ID");
        return NextResponse.json(
          {
            success: false,
            error: "Call data missing required ID",
          },
          { status: 400 }
        );
      }

      // Extract the summary from the call data with priority order
      let summary = "";
      let summarySource = "";

      // Try to get summary from analysis first (highest quality)
      if (callData.call.analysis?.summary) {
        summary = callData.call.analysis.summary;
        summarySource = "analysis";
      }
      // Fall back to direct summary field
      else if (callData.call.summary) {
        summary = callData.call.summary;
        summarySource = "direct";
      }
      // Fall back to transcript if no summary available
      else if (callData.call.transcript) {
        summary = `Call transcript: ${callData.call.transcript}`;
        summarySource = "transcript";
      }
      // Last resort - create summary from messages
      else if (callData.call.messages && callData.call.messages.length > 0) {
        const conversationSummary = callData.call.messages
          .map((msg) => `${msg.role}: ${msg.message}`)
          .join("\n");
        summary = `Call summary based on conversation:\n${conversationSummary}`;
        summarySource = "messages";
      } else {
        summary = "Call completed - no detailed summary available";
        summarySource = "fallback";
      }

      console.log(`📝 Summary extracted from ${summarySource}:`, {
        summaryLength: summary.length,
        summaryPreview:
          summary.substring(0, 100) + (summary.length > 100 ? "..." : ""),
      });

      // Get customer phone number
      const customerNumber = callData.call.customer?.number || "Unknown";

      if (customerNumber === "Unknown") {
        console.warn("⚠️ No customer phone number available in call data");
      }

      // Get customer email from phone number
      const customerEmail = await getCustomerEmailFromPhone(customerNumber);

      if (!customerEmail) {
        console.warn(
          `⚠️ No email found for customer phone number: ${customerNumber}`
        );
      }

      // Send to n8n webhook with comprehensive error handling
      try {
        await sendToN8nWebhook(
          summary,
          "t2k20802@gmail.com",
          customerNumber,
          callData
        );

        const processingTime = Date.now() - startTime;
        console.log(
          `✅ Successfully processed call ${callData.call.id} and sent summary to n8n`,
          {
            callId: callData.call.id,
            customerNumber,
            customerEmail: customerEmail || "fallback_email",
            summaryLength: summary.length,
            summarySource,
            hasAnalysis: !!callData.call.analysis,
            hasTranscript: !!callData.call.transcript,
            processingTimeMs: processingTime,
          }
        );

        return NextResponse.json({
          success: true,
          message: "Call summary sent successfully",
          callId: callData.call.id,
          customerNumber,
          summaryLength: summary.length,
          summarySource,
          emailFound: !!customerEmail,
          processingTimeMs: processingTime,
        });
      } catch (webhookError) {
        const processingTime = Date.now() - startTime;
        const errorMessage =
          webhookError instanceof Error
            ? webhookError.message
            : String(webhookError);
        console.error(
          `❌ Failed to send call ${callData.call.id} to n8n webhook:`,
          {
            callId: callData.call.id,
            customerNumber,
            customerEmail,
            error: errorMessage,
            summaryLength: summary.length,
            summarySource,
            processingTimeMs: processingTime,
          }
        );

        return NextResponse.json(
          {
            success: false,
            error: "Failed to send summary to n8n",
            callId: callData.call.id,
            details: errorMessage,
            customerNumber,
            summaryLength: summary.length,
            summarySource,
            processingTimeMs: processingTime,
          },
          { status: 500 }
        );
      }
    }

    // For other webhook types, just acknowledge receipt
    console.log(
      `ℹ️ Non-end-of-call webhook received: ${body.message?.type || "unknown"}`
    );
    return NextResponse.json({
      success: true,
      message: "Webhook received",
      type: body.message?.type || "unknown",
      processingTimeMs: Date.now() - startTime,
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Webhook processing error:", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      processingTimeMs: processingTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process webhook",
        details: errorMessage,
        processingTimeMs: processingTime,
      },
      { status: 500 }
    );
  }
}
