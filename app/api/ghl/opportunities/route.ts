import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const accessToken = searchParams.get("access_token")
  const locationId = searchParams.get("location_id")

  if (!accessToken || !locationId) {
    return NextResponse.json({ error: "Missing access token or location ID" }, { status: 400 })
  }

  try {
    const response = await fetch(`https://services.leadconnectorhq.com/opportunities/`, {
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
    console.error("Error fetching opportunities:", error)
    return NextResponse.json({ error: "Failed to fetch opportunities" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { accessToken, locationId, opportunity } = await request.json()

  if (!accessToken || !locationId || !opportunity) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const response = await fetch(`https://services.leadconnectorhq.com/opportunities/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...opportunity,
        locationId,
      }),
    })

    if (!response.ok) {
      throw new Error(`GoHighLevel API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating opportunity:", error)
    return NextResponse.json({ error: "Failed to create opportunity" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const { accessToken, opportunityId, updates } = await request.json()

  if (!accessToken || !opportunityId || !updates) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    const response = await fetch(`https://services.leadconnectorhq.com/opportunities/${opportunityId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error(`GoHighLevel API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating opportunity:", error)
    return NextResponse.json({ error: "Failed to update opportunity" }, { status: 500 })
  }
}
