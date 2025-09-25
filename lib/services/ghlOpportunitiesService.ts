// GHL Opportunity Types
export interface GHLOpportunity {
  id?: string;
  name?: string;
  pipelineId?: string;
  pipelineStageId?: string;
  assignedTo?: string;
  status?: string;
  source?: string;
  lastStatusChangeAt?: string;
  lastStageChangeAt?: string;
  lastActivityAt?: string;
  createdAt?: string;
  updatedAt?: string;
  contactId?: string;
  locationId?: string;
  monetaryValue?: number;
  notes?: string;
  customFields?: Record<string, any>;
  followerIds?: string[];
  // Contact information if included
  contact?: {
    id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  // Pipeline information if included
  pipeline?: {
    id?: string;
    name?: string;
    stages?: Array<{
      id?: string;
      name?: string;
      position?: number;
    }>;
  };
}

export interface GHLOpportunitiesResponse {
  opportunities?: GHLOpportunity[];
  meta?: {
    total?: number;
    currentPage?: number;
    nextPage?: number | null;
    prevPage?: number | null;
    totalPages?: number;
  };
}

export interface GHLCustomField {
  id: string;
  key: string;
  field_value: string | string[] | Record<string, any>;
}

export interface GHLCreateOpportunityData {
  pipelineId: string;
  locationId: string;
  contactId: string;
  name: string;
  pipelineStageId?: string;
  status?: string;
  source?: string;
  assignedTo?: string;
  monetaryValue?: number;
  notes?: string;
  customFields?: GHLCustomField[];
}

export interface GHLUpdateOpportunityData {
  name?: string;
  contactId?: string;
  pipelineId?: string;
  pipelineStageId?: string;
  status?: string;
  assignedTo?: string;
  monetaryValue?: number;
  source?: string;
  notes?: string;
  customFields?: GHLCustomField[];
}

// GHL Opportunities API Service
export class GHLOpportunitiesService {
  private token: string;
  private locationId: string;
  private baseUrl = "https://services.leadconnectorhq.com";

  constructor(token: string, locationId: string) {
    this.token = token;
    this.locationId = locationId;
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestOptions = {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    console.log("GHL API Request:", {
      url,
      method: requestOptions.method || "GET",
      headers: requestOptions.headers,
      body: requestOptions.body,
    });

    const response = await fetch(url, requestOptions);

    console.log("GHL API Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("GHL API Error response:", errorText);

      let errorMessage = `GHL API Error: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // If not valid JSON, use the raw text
        if (errorText) {
          errorMessage = errorText;
        }
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("GHL API Success response:", result);
    return result;
  }

  // Search opportunities
  async searchOpportunities(params?: {
    limit?: number;
    offset?: number;
    pipelineId?: string;
    pipelineStageId?: string;
    assignedTo?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    query?: string;
  }): Promise<GHLOpportunitiesResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("location_id", this.locationId);

    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());
    if (params?.pipelineId)
      searchParams.append("pipelineId", params.pipelineId);
    if (params?.pipelineStageId)
      searchParams.append("pipelineStageId", params.pipelineStageId);
    if (params?.assignedTo)
      searchParams.append("assignedTo", params.assignedTo);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.startDate) searchParams.append("startDate", params.startDate);
    if (params?.endDate) searchParams.append("endDate", params.endDate);
    if (params?.query) searchParams.append("q", params.query);

    return this.makeRequest(`/opportunities/search?${searchParams.toString()}`);
  }

  // Get all opportunities (fallback method)
  async getOpportunities(): Promise<GHLOpportunitiesResponse> {
    return this.makeRequest(`/opportunities/?locationId=${this.locationId}`);
  }

  // Get a specific opportunity by ID
  async getOpportunity(opportunityId: string): Promise<GHLOpportunity> {
    return this.makeRequest(`/opportunities/${opportunityId}`);
  }

  // Create a new opportunity
  async createOpportunity(
    opportunityData: GHLCreateOpportunityData
  ): Promise<GHLOpportunity> {
    console.log(
      "GHL Service: Creating opportunity with data:",
      opportunityData
    );

    const payload = {
      ...opportunityData,
      locationId: this.locationId,
    };

    console.log("GHL Service: Final payload:", payload);

    return this.makeRequest("/opportunities/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  // Update an existing opportunity
  async updateOpportunity(
    opportunityId: string,
    updateData: GHLUpdateOpportunityData
  ): Promise<GHLOpportunity> {
    console.log("GHL Service: Updating opportunity with ID:", opportunityId);
    console.log("GHL Service: Update data:", updateData);

    return this.makeRequest(`/opportunities/${opportunityId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  // Delete an opportunity
  async deleteOpportunity(
    opportunityId: string
  ): Promise<{ success: boolean }> {
    return this.makeRequest(`/opportunities/${opportunityId}`, {
      method: "DELETE",
    });
  }

  // Get pipelines (helper method for opportunity creation)
  async getPipelines(): Promise<any> {
    return this.makeRequest(
      `/opportunities/pipelines?locationId=${this.locationId}`
    );
  }
}
