import { type NextRequest, NextResponse } from "next/server";
import { GHLOpportunitiesService } from "@/lib/services/ghlOpportunitiesService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get("access_token");
  const locationId = searchParams.get("location_id");

  // Optional search parameters
  const query = searchParams.get("query");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");
  const pipelineId = searchParams.get("pipelineId");
  const pipelineStageId = searchParams.get("pipelineStageId");
  const assignedTo = searchParams.get("assignedTo");
  const status = searchParams.get("status");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!accessToken || !locationId) {
    return NextResponse.json(
      { error: "Missing access token or location ID" },
      { status: 400 }
    );
  }

  try {
    const opportunitiesService = new GHLOpportunitiesService(
      accessToken,
      locationId
    );

    const params: any = {};
    if (query) params.query = query;
    if (limit) params.limit = parseInt(limit);
    if (offset) params.offset = parseInt(offset);
    if (pipelineId) params.pipelineId = pipelineId;
    if (pipelineStageId) params.pipelineStageId = pipelineStageId;
    if (assignedTo) params.assignedTo = assignedTo;
    if (status) params.status = status;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const data = await opportunitiesService.searchOpportunities(params);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("POST request body:", JSON.stringify(body, null, 2));

    const { accessToken, locationId, opportunity } = body;

    if (!accessToken || !locationId || !opportunity) {
      console.error("Missing required fields:", {
        accessToken: !!accessToken,
        locationId: !!locationId,
        opportunity: !!opportunity,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Creating opportunity with data:", opportunity);

    const opportunitiesService = new GHLOpportunitiesService(
      accessToken,
      locationId
    );

    const data = await opportunitiesService.createOpportunity({
      ...opportunity,
      locationId, // Ensure locationId is included
    });

    console.log("Opportunity created successfully:", data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating opportunity:", error);
    return NextResponse.json(
      {
        error: `Failed to create opportunity: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  console.log("API: PUT opportunities route called");

  const { accessToken, locationId, opportunityId, updates } =
    await request.json();

  console.log("API: Received data:", {
    opportunityId,
    updates,
    accessToken: accessToken ? `${accessToken.substring(0, 10)}...` : "missing",
    locationId,
  });

  if (!accessToken || !locationId || !opportunityId || !updates) {
    console.log("API: Missing required fields");
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const opportunitiesService = new GHLOpportunitiesService(
      accessToken,
      locationId
    );

    console.log("API: Calling service updateOpportunity with:", {
      opportunityId,
      updates,
    });

    const data = await opportunitiesService.updateOpportunity(
      opportunityId,
      updates
    );

    console.log("API: Successfully updated opportunity:", data.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error updating opportunity:", error);
    return NextResponse.json(
      {
        error: "Failed to update opportunity",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
