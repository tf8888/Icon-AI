import { NextResponse } from "next/server";
import supabase from "@/lib/supabaseClient";

export async function GET() {
  try {
    // Fetch all profiles with checkup calls configured
    const { data: profiles, error } = await supabase
      .from("profile")
      .select(
        "user_id, checkupCalls, ghl_pit_token, ghl_location_id, vapi_phone_number_id, vapi_phone_number"
      )
      .not("checkupCalls", "is", null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const analysis =
      profiles?.map((profile) => {
        const { checkupCalls } = profile;
        let status = "disabled";
        let nextCall = null;
        let missingCredentials = [];

        // Check for missing credentials
        if (!profile.ghl_pit_token) missingCredentials.push("ghl_pit_token");
        if (!profile.ghl_location_id)
          missingCredentials.push("ghl_location_id");
        if (!profile.vapi_phone_number_id)
          missingCredentials.push("vapi_phone_number_id");
        if (!profile.vapi_phone_number)
          missingCredentials.push("vapi_phone_number");

        if (checkupCalls?.enabled) {
          status = "enabled";
          const calls = [];

          if (checkupCalls.enableMorning && checkupCalls.morningTime) {
            calls.push({
              type: "morning",
              time: checkupCalls.morningTime,
              isNow: checkupCalls.morningTime === currentTime,
            });
          }

          if (checkupCalls.enableEvening && checkupCalls.eveningTime) {
            calls.push({
              type: "evening",
              time: checkupCalls.eveningTime,
              isNow: checkupCalls.eveningTime === currentTime,
            });
          }

          nextCall = calls;
        }

        return {
          user_id: profile.user_id,
          status,
          nextCall,
          missingCredentials,
          hasAllCredentials: missingCredentials.length === 0,
          checkupCalls,
        };
      }) || [];

    const summary = {
      totalProfiles: profiles?.length || 0,
      enabledProfiles: analysis.filter((p) => p.status === "enabled").length,
      profilesWithCredentials: analysis.filter((p) => p.hasAllCredentials)
        .length,
      profilesReadyForCalls: analysis.filter(
        (p) => p.status === "enabled" && p.hasAllCredentials
      ).length,
      currentTime,
      activeCallsNow: analysis.filter(
        (p) =>
          p.nextCall &&
          Array.isArray(p.nextCall) &&
          p.nextCall.some((call: any) => call.isNow)
      ).length,
    };

    return NextResponse.json({
      summary,
      profiles: analysis,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to analyze checkup call status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { user_id, forceTime } = await req.json().catch(() => ({}));

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required for testing" },
        { status: 400 }
      );
    }

    // Fetch the specific user profile
    const { data: profile, error } = await supabase
      .from("profile")
      .select(
        "user_id, checkupCalls, ghl_pit_token, ghl_location_id, vapi_phone_number_id, vapi_phone_number"
      )
      .eq("user_id", user_id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Use forced time or current time
    const testTime =
      forceTime ||
      `${new Date().getHours().toString().padStart(2, "0")}:${new Date()
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

    // Simulate the cronjob logic for this specific user
    const { checkupCalls } = profile;

    if (!checkupCalls?.enabled) {
      return NextResponse.json({
        message: "Checkup calls are disabled for this user",
        user_id,
        testTime,
        profile: {
          checkupCalls,
          hasCredentials: !!(
            profile.ghl_pit_token &&
            profile.ghl_location_id &&
            profile.vapi_phone_number_id
          ),
        },
      });
    }

    let shouldTriggerCall = false;
    let callType = "";

    // Check morning call
    if (checkupCalls.enableMorning && checkupCalls.morningTime === testTime) {
      shouldTriggerCall = true;
      callType = "morning";
    }

    // Check evening call
    if (checkupCalls.enableEvening && checkupCalls.eveningTime === testTime) {
      shouldTriggerCall = true;
      callType = "evening";
    }

    if (!shouldTriggerCall) {
      return NextResponse.json({
        message: "No calls scheduled for this time",
        user_id,
        testTime,
        checkupCalls,
        nextCalls: [
          checkupCalls.enableMorning
            ? { type: "morning", time: checkupCalls.morningTime }
            : null,
          checkupCalls.enableEvening
            ? { type: "evening", time: checkupCalls.eveningTime }
            : null,
        ].filter(Boolean),
      });
    }

    // Test the call (you can set dryRun=true to not actually make the call)
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

    return NextResponse.json({
      message: `Test call triggered for user ${user_id}`,
      callType,
      testTime,
      callPayload,
      note: "This is a test simulation. To actually trigger the call, use the /api/vapi/assistants/sendCheckupCall endpoint directly.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
