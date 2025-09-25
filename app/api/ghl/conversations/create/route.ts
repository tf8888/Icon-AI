import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { accessToken, locationId, contactId } = await request.json();

    if (!accessToken || !locationId || !contactId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://services.leadconnectorhq.com/conversations/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Version: "2021-04-15",
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationId,
          contactId,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;

      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }

      // Handle specific case where conversation already exists
      if (
        response.status === 400 &&
        errorData.message === "Conversation already exists"
      ) {
        return NextResponse.json(
          {
            error: "Conversation already exists",
            conversationId: errorData.conversationId,
            existingConversation: true,
          },
          { status: 409 }
        ); // Use 409 Conflict status
      }

      throw new Error(`GHL API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
