import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const opportunityId = searchParams.get("id")

    if (!opportunityId) {
      return NextResponse.json({ error: "Opportunity ID is required" }, { status: 400 })
    }

    // In a real implementation, you would:
    // 1. Get the access token from your database or session
    // 2. Make the API call to GoHighLevel

    const ghlResponse = await fetch(`https://services.leadconnectorhq.com/opportunities/${opportunityId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.GHL_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        Version: "2021-07-28",
      },
      body: JSON.stringify({
        title: body.title,
        status: body.stage,
        monetaryValue: body.value,
        assignedTo: body.assignedTo,
        contactId: body.contactId,
        source: body.source,
        description: body.description,
        // Map your form fields to GoHighLevel API fields
      }),
    })

    if (!ghlResponse.ok) {
      throw new Error(`GoHighLevel API error: ${ghlResponse.statusText}`)
    }

    const data = await ghlResponse.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating opportunity:", error)
    return NextResponse.json({ error: "Failed to update opportunity" }, { status: 500 })
  }
}
