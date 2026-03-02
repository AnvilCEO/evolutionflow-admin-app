/**
 * Studio Types - 스튜디오 관련 타입 정의
 */

export type StudioTab = "official" | "partner" | "associated";
export type StudioCountry = "KR" | "CN";
export type AdminStudioStatus = "active" | "inactive" | "maintenance";

/**
 * Teacher Studio - 조회용 기본 데이터 모델
 */
export interface StudioItem {
  id: string;
  tab: StudioTab;
  name: string;
  country: StudioCountry;
  city: string;
  region: string;
  address: string;
  phone: string;
  social: string;
  lat: number;
  lng: number;
  thumbnail?: string;
}

/**
 * Admin Studio - 관리용 확장 데이터 모델
 */
export interface AdminStudioItem extends StudioItem {
  // 추가 관리 필드
  managerName: string;
  managerPhone: string;
  managerEmail: string;

  capacity: number;
  status: AdminStudioStatus;
  description?: string;
  operatingHours?: string;
  amenities?: string[];

  // 메타 정보
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

/**
 * Studio Form - 폼 입력용
 */
export interface StudioFormData {
  name: string;
  tab: StudioTab;
  country: StudioCountry;
  city: string;
  region: string;
  address: string;
  phone: string;
  social?: string;
  lat: number;
  lng: number;
  managerName?: string;
  managerPhone?: string;
  managerEmail?: string;
  capacity?: number;
  status?: AdminStudioStatus;
  description?: string;
  operatingHours?: string;
  amenities?: string[];
  thumbnail?: string;
}

/**
 * Studio API Response
 */
export interface StudioListResponse {
  success: boolean;
  data: AdminStudioItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface StudioDetailResponse {
  success: boolean;
  data: AdminStudioItem;
}

export interface StudioCreateResponse {
  success: boolean;
  data: AdminStudioItem;
  message: string;
}

export interface StudioUpdateResponse {
  success: boolean;
  data: AdminStudioItem;
  message: string;
}

export interface StudioStatusUpdateResponse {
  success: boolean;
  data: AdminStudioItem;
  message: string;
}

export interface StudioDeleteResponse {
  success: boolean;
  message: string;
}

/**
 * Studio Filter Options
 */
export interface StudioListFilters {
  tab: StudioTab;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: AdminStudioStatus;
  country?: StudioCountry;
  city?: string;
  region?: string;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
}

/**
 * Studio Tab Label
 */
export const STUDIO_TAB_LABEL: Record<StudioTab, string> = {
  official: "공인 스튜디오 Official Studio",
  partner: "파트너 스튜디오 Partner Studio",
  associated: "협력 스튜디오 Associated Studio",
};

export const STUDIO_TAB_ORDER: StudioTab[] = [
  "official",
  "partner",
  "associated",
];

export const STUDIO_STATUS_LABEL: Record<AdminStudioStatus, string> = {
  active: "운영 중",
  inactive: "운영 중지",
  maintenance: "점검 중",
};

export const STUDIO_STATUS_COLORS: Record<AdminStudioStatus, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-red-100 text-red-800",
  maintenance: "bg-yellow-100 text-yellow-800",
};
