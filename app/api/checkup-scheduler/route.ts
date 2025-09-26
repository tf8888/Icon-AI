import { NextResponse } from "next/server";
import supabase from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    console.log("Cronjob triggered at:", new Date().toISOString());

    // Get current time in user's timezone (for now, using UTC)
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, "0");
    const currentMinute = now.getMinutes().toString().padStart(2, "0");
    const currentTime = `${currentHour}:${currentMinute}`;

    console.log("Current time:", currentTime);

    // Fetch all users with checkup calls enabled
    const { data: profiles, error } = await supabase
      .from("profile")
      .select(
        "user_id, ghl_pit_token, ghl_location_id, vapi_phone_number_id, vapi_phone_number, checkupCalls"
      )
      .not("checkupCalls", "is", null)
      .not("ghl_pit_token", "is", null)
      .not("vapi_phone_number_id", "is", null);

    if (error) {
      console.error("Error fetching profiles:", error);
      return NextResponse.json(
        { error: "Failed to fetch profiles" },
        { status: 500 }
      );
    }

    if (!profiles || profiles.length === 0) {
      console.log("No profiles found with checkup calls configured");
      return NextResponse.json({ message: "No profiles found" });
    }

    console.log(`Found ${profiles.length} profiles to check`);

    const callsTriggered = [];

    // Process each profile
    for (const profile of profiles) {
      const { checkupCalls } = profile;

      // Skip if checkup calls are disabled
      if (!checkupCalls?.enabled) {
        console.log(`Checkup calls disabled for user ${profile.user_id}`);
        continue;
      }

      let shouldTriggerCall = false;
      let callType = "";

      // Check if it's time for morning call
      if (checkupCalls.enableMorning && checkupCalls.morningTime) {
        const morningTime = checkupCalls.morningTime;
        if (currentTime === morningTime) {
          shouldTriggerCall = true;
          callType = "morning";
        }
      }

      // Check if it's time for evening call
      if (checkupCalls.enableEvening && checkupCalls.eveningTime) {
        const eveningTime = checkupCalls.eveningTime;
        if (currentTime === eveningTime) {
          shouldTriggerCall = true;
          callType = "evening";
        }
      }

      if (shouldTriggerCall) {
        console.log(
          `Triggering ${callType} checkup call for user ${profile.user_id}`
        );

        try {
          // Prepare the payload for the sendCheckupCall API
          const callPayload = {
            user_id: profile.user_id,
            ghl_pit_token: profile.ghl_pit_token,
            ghl_location_id: profile.ghl_location_id,
            vapi_phone_number_id: profile.vapi_phone_number_id,
            vapi_phone_number: profile.vapi_phone_number,
            callType,
            locationId: profile.ghl_location_id,
            model: {
              provider: "openai",
              model: "gpt-4o",
              messages: [],
            },
          };

          // Make internal API call to sendCheckupCall
          const response = await fetch(
            `${
              process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
            }/api/vapi/assistants/sendCheckupCall`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(callPayload),
            }
          );

          if (response.ok) {
            const result = await response.json();
            console.log(
              `Successfully triggered ${callType} call for user ${profile.user_id}:`,
              result
            );
            callsTriggered.push({
              user_id: profile.user_id,
              callType,
              status: "success",
              assistantId: result.id,
            });
          } else {
            const error = await response.text();
            console.error(
              `Failed to trigger ${callType} call for user ${profile.user_id}:`,
              error
            );
            callsTriggered.push({
              user_id: profile.user_id,
              callType,
              status: "error",
              error: error,
            });
          }
        } catch (error) {
          console.error(
            `Error triggering ${callType} call for user ${profile.user_id}:`,
            error
          );
          callsTriggered.push({
            user_id: profile.user_id,
            callType,
            status: "error",
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    const successfulCalls = callsTriggered.filter(
      (call) => call.status === "success"
    ).length;
    const failedCalls = callsTriggered.filter(
      (call) => call.status === "error"
    ).length;

    console.log(
      `Cronjob completed. Successful calls: ${successfulCalls}, Failed calls: ${failedCalls}`
    );

    return NextResponse.json({
      message: "Cronjob completed successfully",
      currentTime,
      profilesChecked: profiles.length,
      callsTriggered: callsTriggered.length,
      successfulCalls,
      failedCalls,
      details: callsTriggered,
    });
  } catch (error) {
    console.error("Cronjob error:", error);
    return NextResponse.json(
      {
        error: "Cronjob failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Also support GET for testing purposes
export async function GET() {
  return NextResponse.json({
    message: "Checkup Call Scheduler is running",
    timestamp: new Date().toISOString(),
    note: "Use POST method to trigger the cronjob",
  });
}
