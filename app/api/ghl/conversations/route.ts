import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const accessToken = searchParams.get("access_token")
  const locationId = searchParams.get("location_id")

  if (!accessToken || !locationId) {
    return NextResponse.json({ error: "Missing access token or location ID" }, { status: 400 })
  }

  try {
    const response = await fetch(`https://services.leadconnectorhq.com/conversations/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`GoHighLevel API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { accessToken, locationId, contactId, message } = await request.json()

  if (!accessToken || !locationId || !contactId || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const response = await fetch(`https://services.leadconnectorhq.com/conversations/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "SMS",
        contactId,
        message,
      }),
    })

    if (!response.ok) {
      throw new Error(`GoHighLevel API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
