// GHL Contact Types
export interface GHLContact {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  source?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  dateOfBirth?: string;
  companyName?: string;
  website?: string;
  timezone?: string;
  dnd?: boolean;
  dndSettings?: {
    Call?: {
      status?: string;
      message?: string;
      code?: string;
    };
    Email?: {
      status?: string;
      message?: string;
      code?: string;
    };
    SMS?: {
      status?: string;
      message?: string;
      code?: string;
    };
    WhatsApp?: {
      status?: string;
      message?: string;
      code?: string;
    };
    GMB?: {
      status?: string;
      message?: string;
      code?: string;
    };
    FB?: {
      status?: string;
      message?: string;
      code?: string;
    };
  };
  dateAdded?: string;
  dateUpdated?: string;
}

export interface GHLContactsResponse {
  contacts: GHLContact[];
  meta?: {
    total?: number;
    count?: number;
    nextPageUrl?: string;
  };
}

export interface GHLCreateContactData {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  source?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  companyName?: string;
  website?: string;
}

export interface GHLUpdateContactData extends GHLCreateContactData {
  id: string;
  // Read-only properties that may be present but should be filtered out
  locationId?: string;
  contactName?: string;
  firstNameRaw?: string;
  lastNameRaw?: string;
  dateAdded?: string;
  dateUpdated?: string;
  followers?: any[];
  // Additional potentially read-only properties
  name?: string;
  timezone?: string;
  dnd?: boolean;
  dndSettings?: any;
}

// GHL Contacts API Service
export class GHLContactsService {
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
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
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

    return response.json();
  }

  // Get all contacts
  async getContacts(params?: {
    limit?: number;
    skip?: number;
    startAfter?: string;
    startAfterId?: string;
    query?: string;
  }): Promise<GHLContactsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("locationId", this.locationId);

    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.skip) searchParams.append("skip", params.skip.toString());
    if (params?.startAfter)
      searchParams.append("startAfter", params.startAfter);
    if (params?.startAfterId)
      searchParams.append("startAfterId", params.startAfterId);
    if (params?.query) searchParams.append("query", params.query);

    return this.makeRequest(`/contacts/?${searchParams.toString()}`);
  }

  // Get a specific contact by ID
  async getContact(contactId: string): Promise<GHLContact> {
    return this.makeRequest(`/contacts/${contactId}`);
  }

  // Create a new contact
  async createContact(contactData: GHLCreateContactData): Promise<GHLContact> {
    return this.makeRequest("/contacts/", {
      method: "POST",
      body: JSON.stringify({
        ...contactData,
        locationId: this.locationId,
      }),
    });
  }

  // Update an existing contact
  async updateContact(
    contactId: string,
    contactData: GHLUpdateContactData
  ): Promise<GHLContact> {
    // Filter out read-only properties that shouldn't be sent to the API
    const {
      id,
      locationId,
      contactName,
      firstNameRaw,
      lastNameRaw,
      dateAdded,
      dateUpdated,
      followers,
      timezone,
      dnd,
      dndSettings,
      ...updateData
    } = contactData;

    console.log("Updating contact with filtered data:", updateData);

    return this.makeRequest(`/contacts/${contactId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  }

  // Delete a contact
  async deleteContact(contactId: string): Promise<void> {
    await this.makeRequest(`/contacts/${contactId}`, {
      method: "DELETE",
    });
  }

  // Search contacts by query
  async searchContacts(
    query: string,
    limit?: number
  ): Promise<GHLContactsResponse> {
    return this.getContacts({ query, limit });
  }
}

// Hook to use GHL Contacts Service
import { useMemo } from "react";

export function useGHLContactsService(
  token?: string | null,
  locationId?: string | null
) {
  return useMemo(() => {
    if (!token || !locationId) {
      return null;
    }
    return new GHLContactsService(token, locationId);
  }, [token, locationId]);
}
