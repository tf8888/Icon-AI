// GHL Courses / Memberships Types
export interface GHLCourse {
  id?: string;
  name?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  thumbnailUrl?: string;
  category?: string;
}

export interface GHLCoursesResponse {
  courses?: GHLCourse[];
  meta?: {
    total?: number;
    count?: number;
    nextPageUrl?: string;
  };
}

// GHL Courses API Service
export class GHLCoursesService {
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
        Accept: "application/json",
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GHL API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // List courses (memberships products)
  async listCourses(params?: { limit?: number; query?: string }): Promise<GHLCoursesResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("locationId", this.locationId);
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.query) searchParams.append("query", params.query);

    // Memberships API path for courses/products
    // Endpoint naming varies in docs; using memberships/courses as canonical path
    return this.makeRequest(`/memberships/courses?${searchParams.toString()}`);
  }

  // Get single course details
  async getCourse(courseId: string): Promise<GHLCourse> {
    return this.makeRequest(`/memberships/courses/${courseId}`);
  }
}

// Hook to use GHL Courses Service
import { useMemo } from "react";

export function useGHLCoursesService(
  token?: string | null,
  locationId?: string | null
) {
  return useMemo(() => {
    if (!token || !locationId) {
      return null;
    }
    return new GHLCoursesService(token, locationId);
  }, [token, locationId]);
}


