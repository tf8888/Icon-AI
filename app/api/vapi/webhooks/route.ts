import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
  callData: any
): Promise<{ success: boolean; id?: number; error?: string }> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: "Supabase configuration missing" };
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log(`💾 Saving call summary to database:`, {
      userId,
      summaryLength: callData.summary.length,
      transcriptLength: callData.transcript?.length || 0,
      hasTranscript: !!callData.transcript,
      callId: callData.call.id,
    });

    const { data, error } = await supabase
      .from("checkups")
      .insert({
        user_id: userId,
        summary: callData.summary,
        transcript: callData.transcript || null,
        // Let the database handle created_at with its default NOW() value
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error saving to checkups table:", error);

      // If it's a duplicate key error, try to find the existing record
      if (error.code === "23505") {
        console.log("🔍 Duplicate key error, searching for existing record...");
        const { data: existingRecord } = await supabase
          .from("checkups")
          .select("id")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingRecord) {
          console.log(
            "✅ Found existing record, using that:",
            existingRecord.id
          );
          return { success: true, id: existingRecord.id };
        }
      }

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
      callId: body.message?.call.id || "unknown",
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
      const callData = body.message;

      console.log("🔍 Processing end-of-call-report:", {
        callId: callData.call.id,
        status: callData.call.status,
        endedReason: callData.endedReason,
        hasTranscript: !!callData.transcript,
        hasAnalysis: !!callData.analysis,
        hasSummary: !!callData.summary,
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

      // Get customer phone number
      const customerNumber = callData.call.customer.number || "Unknown";

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
        const saveResult = await saveCallSummaryToDatabase(userId, callData);

        const processingTime = Date.now() - startTime;

        if (saveResult.success) {
          console.log(
            `✅ Successfully processed call ${callData.call.id} and saved summary to database`,
            {
              callId: callData.call.id,
              userId,
              customerNumber,
              checkupId: saveResult.id,
              summaryLength: callData.summary.length,
              hasAnalysis: !!callData.analysis,
              hasTranscript: !!callData.transcript,
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
            summaryLength: callData.summary.length,
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
              summaryLength: callData.summary.length,
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
              summaryLength: callData.summary.length,
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
            summaryLength: callData.summary.length,
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
            summaryLength: callData.summary.length,
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
