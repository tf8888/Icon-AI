import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get("access_token");
  const locationId = searchParams.get("location_id");

  if (!accessToken || !locationId) {
    return NextResponse.json(
      { error: "Missing access token or location ID" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://services.leadconnectorhq.com/opportunities/pipelines?locationId=${locationId}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          Version: "2021-07-28",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GoHighLevel API error: ${response.status} - ${errorText}`);
      throw new Error(`GoHighLevel API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Pipelines fetched successfully:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching pipelines:", error);
    return NextResponse.json(
      {
        error: `Failed to fetch pipelines: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
