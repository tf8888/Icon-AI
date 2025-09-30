import { NextRequest, NextResponse } from "next/server";
import { runAction } from "@/lib/actions/runner";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const a = auth();
    const userId: string | undefined = (a as any)?.userId;

    const body = await request.json();
    const { actionId, input, accessToken, locationId } = body || {};
    if (!actionId) {
      return NextResponse.json({ error: "Missing actionId" }, { status: 400 });
    }

    let ctx = {
      userId: userId ?? "anonymous",
      locationId: (locationId as string | undefined) || undefined,
      ghlAccessToken: (accessToken as string | undefined) || undefined,
      requestId: request.headers.get("x-request-id") || undefined,
    } as const;

    if (!ctx.ghlAccessToken || !ctx.locationId) {
      // Attempt best-effort profile lookup only if Supabase env is configured
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && userId) {
        try {
          const { getProfileByUserId } = await import("@/lib/auth");
          const profile = await getProfileByUserId(userId as string);
          ctx = {
            ...ctx,
            locationId: ctx.locationId || (profile?.ghl_location_id as string | undefined),
            ghlAccessToken: ctx.ghlAccessToken || (profile?.ghl_pit_token as string | undefined),
          } as const;
        } catch (e) {
          // ignore; will be validated by action runner
        }
      }
    }

    const result = await runAction(actionId, input, ctx);
    const status = result.status === "failed" ? 400 : 200;
    return NextResponse.json(result, { status });
  } catch (err: any) {
    console.error("/api/actions/execute error:", err);
    return NextResponse.json({ error: err?.message || "Unexpected error" }, { status: 500 });
  }
}


