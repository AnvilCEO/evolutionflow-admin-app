/**
 * Backend Studio API Client
 * Direct communication with NestJS backend API
 */

import type {
  StudioFormData,
  StudioListFilters,
} from "@/types/studio";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * Fetch studios list from backend
 */
export async function fetchStudiosFromBackend(
  filters: Partial<{
    tab?: string;
    status?: string;
    country?: string;
    city?: string;
    region?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortKey?: string;
    sortDirection?: string;
  }>,
  accessToken?: string
) {
  try {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.tab) params.append("tab", filters.tab);
    if (filters.status) params.append("status", filters.status);
    if (filters.country) params.append("country", filters.country);
    if (filters.city) params.append("city", filters.city);
    if (filters.region) params.append("region", filters.region);
    if (filters.search) params.append("search", filters.search);

    const response = await fetch(
      `${BACKEND_URL}/studios?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform backend response format to admin format
    return {
      success: true,
      data: data.data || [],
      pagination: {
        page: data.page || 1,
        pageSize: data.limit || 10,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / (data.limit || 10)),
      },
    };
  } catch (error) {
    console.error("Error fetching studios from backend:", error);
    throw error;
  }
}

/**
 * Fetch single studio from backend
 */
export async function fetchStudioFromBackend(
  studioId: string,
  accessToken?: string
) {
  try {
    const response = await fetch(`${BACKEND_URL}/studios/${studioId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Studio not found: ${response.statusText}`);
    }

    const studio = await response.json();

    return {
      success: true,
      data: studio,
    };
  } catch (error) {
    console.error("Error fetching studio from backend:", error);
    throw error;
  }
}

/**
 * Create studio in backend
 */
export async function createStudioInBackend(
  data: StudioFormData,
  accessToken?: string
) {
  try {
    const response = await fetch(`${BACKEND_URL}/studios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create studio: ${response.statusText}`
      );
    }

    const studio = await response.json();

    return {
      success: true,
      data: studio,
      message: "스튜디오가 등록되었습니다.",
    };
  } catch (error) {
    console.error("Error creating studio in backend:", error);
    throw error;
  }
}

/**
 * Update studio in backend
 */
export async function updateStudioInBackend(
  studioId: string,
  data: Partial<StudioFormData>,
  accessToken?: string
) {
  try {
    const response = await fetch(`${BACKEND_URL}/studios/${studioId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update studio: ${response.statusText}`
      );
    }

    const studio = await response.json();

    return {
      success: true,
      data: studio,
      message: "스튜디오 정보가 저장되었습니다.",
    };
  } catch (error) {
    console.error("Error updating studio in backend:", error);
    throw error;
  }
}

/**
 * Delete studio from backend
 */
export async function deleteStudioFromBackend(
  studioId: string,
  accessToken?: string
) {
  try {
    const response = await fetch(`${BACKEND_URL}/studios/${studioId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete studio: ${response.statusText}`
      );
    }

    return {
      success: true,
      message: "스튜디오가 삭제되었습니다.",
    };
  } catch (error) {
    console.error("Error deleting studio from backend:", error);
    throw error;
  }
}
