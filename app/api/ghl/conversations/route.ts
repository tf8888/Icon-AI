import { type NextRequest, NextResponse } from "next/server";
import { GHLConversationsService } from "@/lib/services/ghlConversationsService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get("access_token");
  const locationId = searchParams.get("location_id");
  const query = searchParams.get("query");
  const limit = searchParams.get("limit");

  if (!accessToken || !locationId) {
    return NextResponse.json(
      { error: "Missing access token or location ID" },
      { status: 400 }
    );
  }

  try {
    const conversationsService = new GHLConversationsService(
      accessToken,
      locationId
    );

    const params = {
      limit: limit ? parseInt(limit) : undefined,
      query: query || undefined,
      sort: "desc" as const,
      sortBy: "date_updated",
    };

    let data;
    if (query) {
      data = await conversationsService.searchConversationsByQuery(
        query,
        params.limit
      );
    } else {
      data = await conversationsService.getConversations(params);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const {
    accessToken,
    locationId,
    contactId,
    message,
    type = "SMS",
    subject,
    emailTo,
    emailFrom,
  } = await request.json();

  if (!accessToken || !locationId || !contactId || !message) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const conversationsService = new GHLConversationsService(
      accessToken,
      locationId
    );

    const messageData = {
      type: type as "SMS" | "Email" | "Call" | "WhatsApp" | "GMB" | "FB",
      contactId,
      message,
      ...(subject && { subject }),
      ...(emailTo && { emailTo }),
      ...(emailFrom && { emailFrom }),
    };

    const data = await conversationsService.createMessage(messageData);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
