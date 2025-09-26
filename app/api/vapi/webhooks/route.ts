import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

// Function to get user_id from phone number
async function getUserIdFromPhone(phoneNumber: string): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase configuration missing for user lookup");
    return null;
  }

  try {
    console.log(`Looking up user_id for phone: ${phoneNumber}`);
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

    console.log(`Trying phone variations for user lookup:`, phoneVariations);

    for (const phoneVar of phoneVariations) {
      try {
        const { data, error } = await supabase
          .from("profile")
          .select("user_id")
          .eq("phone_number", phoneVar)
          .maybeSingle();

        if (error) {
          console.warn(`Error querying phone ${phoneVar}:`, error.message);
          continue;
        }

        if (data?.user_id) {
          console.log(
            `Found user_id for phone ${phoneNumber}: ${data.user_id}`
          );
          return data.user_id;
        }
      } catch (queryError) {
        console.warn(
          `Query failed for phone variation ${phoneVar}:`,
          queryError
        );
        continue;
      }
    }

    console.log(`No user_id found for any phone variation of ${phoneNumber}`);
    return null;
  } catch (error) {
    console.error("Database error fetching user_id:", {
      phoneNumber,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// Function to save call summary to checkups table
async function saveCallSummaryToDatabase(
  userId: string,
  summary: string,
  callData: VapiCallEndedMessage
): Promise<{ success: boolean; id?: number; error?: string }> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: "Supabase configuration missing" };
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log(`💾 Saving call summary to database:`, {
      userId,
      summaryLength: summary.length,
      callId: callData.call.id,
    });

    const { data, error } = await supabase
      .from("checkups")
      .insert({
        user_id: userId,
        summary: summary,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error saving to checkups table:", error);
      return { success: false, error: error.message };
    }

    console.log(`✅ Successfully saved call summary:`, {
      checkupId: data.id,
      userId,
      callId: callData.call.id,
    });

    return { success: true, id: data.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Database error saving call summary:", {
      userId,
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
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
        return NextResponse.json(
          {
            success: false,
            error: "No customer phone number available",
            callId: callData.call.id,
          },
          { status: 400 }
        );
      }

      // Get user_id from phone number
      const userId = await getUserIdFromPhone(customerNumber);

      if (!userId) {
        console.warn(
          `⚠️ No user_id found for customer phone number: ${customerNumber}`
        );
        return NextResponse.json(
          {
            success: false,
            error: "User not found for this phone number",
            callId: callData.call.id,
            customerNumber,
          },
          { status: 404 }
        );
      }

      // Save call summary to database
      try {
        const saveResult = await saveCallSummaryToDatabase(
          userId,
          summary,
          callData
        );

        const processingTime = Date.now() - startTime;

        if (saveResult.success) {
          console.log(
            `✅ Successfully processed call ${callData.call.id} and saved summary to database`,
            {
              callId: callData.call.id,
              userId,
              customerNumber,
              checkupId: saveResult.id,
              summaryLength: summary.length,
              summarySource,
              hasAnalysis: !!callData.call.analysis,
              hasTranscript: !!callData.call.transcript,
              processingTimeMs: processingTime,
            }
          );

          return NextResponse.json({
            success: true,
            message: "Call summary saved successfully",
            callId: callData.call.id,
            userId,
            customerNumber,
            checkupId: saveResult.id,
            summaryLength: summary.length,
            summarySource,
            processingTimeMs: processingTime,
          });
        } else {
          console.error(
            `❌ Failed to save call ${callData.call.id} summary to database:`,
            {
              callId: callData.call.id,
              userId,
              customerNumber,
              error: saveResult.error,
              summaryLength: summary.length,
              summarySource,
              processingTimeMs: processingTime,
            }
          );

          return NextResponse.json(
            {
              success: false,
              error: "Failed to save summary to database",
              callId: callData.call.id,
              details: saveResult.error,
              userId,
              customerNumber,
              summaryLength: summary.length,
              summarySource,
              processingTimeMs: processingTime,
            },
            { status: 500 }
          );
        }
      } catch (saveError) {
        const processingTime = Date.now() - startTime;
        const errorMessage =
          saveError instanceof Error ? saveError.message : String(saveError);
        console.error(
          `❌ Unexpected error saving call ${callData.call.id} summary:`,
          {
            callId: callData.call.id,
            userId,
            customerNumber,
            error: errorMessage,
            summaryLength: summary.length,
            summarySource,
            processingTimeMs: processingTime,
          }
        );

        return NextResponse.json(
          {
            success: false,
            error: "Unexpected error saving summary",
            callId: callData.call.id,
            details: errorMessage,
            userId,
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
