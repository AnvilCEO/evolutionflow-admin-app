/**
 * Studio API Functions
 * 스튜디오 CRUD 관련 API
 */

import type {
  AdminStudioItem,
  StudioListResponse,
  StudioDetailResponse,
  StudioCreateResponse,
  StudioUpdateResponse,
  StudioStatusUpdateResponse,
  StudioDeleteResponse,
  StudioListFilters,
  StudioFormData,
  StudioTab,
  AdminStudioStatus,
} from "@/types/studio";

/**
 * 스튜디오 목록 조회
 */
export async function getStudios(
  filters: StudioListFilters,
  accessToken?: string
): Promise<StudioListResponse> {
  try {
    const params = new URLSearchParams();
    params.append("tab", filters.tab);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.pageSize) params.append("pageSize", filters.pageSize.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.status) params.append("status", filters.status);
    if (filters.country) params.append("country", filters.country);
    if (filters.city) params.append("city", filters.city);
    if (filters.region) params.append("region", filters.region);
    if (filters.sortKey) params.append("sortKey", filters.sortKey);
    if (filters.sortDirection) params.append("sortDirection", filters.sortDirection);

    const response = await fetch(`/api/admin/studios?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch studios: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching studios:", error);
    throw error;
  }
}

/**
 * 스튜디오 상세 조회
 */
export async function getStudio(
  studioId: string,
  accessToken?: string
): Promise<StudioDetailResponse> {
  try {
    const response = await fetch(`/api/admin/studios/${studioId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch studio: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching studio:", error);
    throw error;
  }
}

/**
 * 신규 스튜디오 등록
 */
export async function createStudio(
  data: StudioFormData,
  accessToken?: string
): Promise<StudioCreateResponse> {
  try {
    const response = await fetch("/api/admin/studios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to create studio: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating studio:", error);
    throw error;
  }
}

/**
 * 스튜디오 정보 수정
 */
export async function updateStudio(
  studioId: string,
  data: Partial<StudioFormData>,
  accessToken?: string
): Promise<StudioUpdateResponse> {
  try {
    const response = await fetch(`/api/admin/studios/${studioId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update studio: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating studio:", error);
    throw error;
  }
}

/**
 * 스튜디오 상태 변경
 */
export async function updateStudioStatus(
  studioId: string,
  status: AdminStudioStatus,
  accessToken?: string
): Promise<StudioStatusUpdateResponse> {
  try {
    const response = await fetch(`/api/admin/studios/${studioId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update status: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating studio status:", error);
    throw error;
  }
}

/**
 * 스튜디오 삭제
 */
export async function deleteStudio(
  studioId: string,
  accessToken?: string
): Promise<StudioDeleteResponse> {
  try {
    const response = await fetch(`/api/admin/studios/${studioId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete studio: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting studio:", error);
    throw error;
  }
}

/**
 * 스튜디오 유형별 탭 필터링
 */
export function filterStudiosByTab(
  studios: AdminStudioItem[],
  tab: StudioTab
): AdminStudioItem[] {
  return studios.filter((studio) => studio.tab === tab);
}

/**
 * 스튜디오 목록 검색
 */
export function searchStudios(
  studios: AdminStudioItem[],
  searchQuery: string
): AdminStudioItem[] {
  if (!searchQuery) return studios;

  const query = searchQuery.toLowerCase();
  return studios.filter(
    (studio) =>
      studio.name.toLowerCase().includes(query) ||
      studio.address.toLowerCase().includes(query) ||
      studio.city.toLowerCase().includes(query) ||
      studio.region.toLowerCase().includes(query)
  );
}
