import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as any;
  const pitToken = body?.pitToken;
  const postedLocationId = body?.locationId;

  const token = pitToken || process.env.GHL_PIT_TOKEN;
  const locationId = postedLocationId || process.env.GHL_LOCATION_ID;

  if (!token) {
    return NextResponse.json(
      { error: "GHL_PIT_TOKEN not provided (body) or configured on server" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://services.leadconnectorhq.com/locations/${locationId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Version: "2021-07-28",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `MCP request failed: ${errorText}` },
        { status: response.status }
      );
    }

    const text = await response.text();
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json);
    } catch (e) {
      return NextResponse.json({ raw: text });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
