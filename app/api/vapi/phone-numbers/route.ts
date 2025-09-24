import { NextRequest, NextResponse } from "next/server";
import { getAvailablePhoneNumbers, createPhoneNumber } from "@/lib/vapi";
import supabase from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch available phone numbers from VAPI
    let vapiNumbers = await getAvailablePhoneNumbers();

    // 2. If no number, create a new one
    // if (!vapiNumbers) {
    //   const created = await createPhoneNumber();
    //   vapiNumbers = created?.data || null;
    // }

    return NextResponse.json({ vapiNumbers });
  } catch (error) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as any).message
        : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Save selected phone number to DB
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json(
        { error: "Missing user_id or phone_number" },
        { status: 400 }
      );
    }

    const created = await createPhoneNumber(user_id);

    // Save to profile table (add column if needed)
    // const { error } = await supabase
    //   .from("profile")
    //   .upsert({
    //     user_id,
    //     vapi_phone_number: "sip:user_32ymxfgf2icslybq37epiezt1kc@sip.vapi.ai",
    //   });

    // if (error) {
    //   return NextResponse.json({ error: error.message }, { status: 500 });
    // }
    return NextResponse.json({
      phoneNumber: created.sipUri,
      phoneNumberId: created.id,
    });
  } catch (error) {
    const message =
      typeof error === "object" && error && "message" in error
        ? (error as any).message
        : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
