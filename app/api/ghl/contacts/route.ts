import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get("access_token");
  const locationId = searchParams.get("location_id");
  const query = searchParams.get("query");
  const limit = searchParams.get("limit");
  const startAfterId = searchParams.get("startAfterId");

  if (!accessToken || !locationId) {
    return NextResponse.json(
      { error: "Missing access token or location ID" },
      { status: 400 }
    );
  }

  try {
    const url = new URL("https://services.leadconnectorhq.com/contacts/");
    url.searchParams.append("locationId", locationId);

    if (query) url.searchParams.append("query", query);
    if (limit) url.searchParams.append("limit", limit);
    if (startAfterId) url.searchParams.append("startAfterId", startAfterId);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Version: "2021-07-28",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GHL API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessToken = "your-stored-access-token"; // Get from secure storage

    const response = await fetch(
      "https://services.leadconnectorhq.com/contacts/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Version: "2021-07-28",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create contact");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
