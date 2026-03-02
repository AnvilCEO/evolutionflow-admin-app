import type { AdminStudioItem, StudioFormData, StudioTab, AdminStudioStatus } from "@/types/studio";

/**
 * Test Fixtures for Studio Data
 */

export const mockStudioBase = {
  id: "s1234567890",
  name: "강남 테스트 스튜디오",
  tab: "official" as StudioTab,
  country: "KR" as const,
  city: "seoul",
  region: "강남구",
  address: "서울시 강남구 테헤란로 123",
  phone: "02-1234-5678",
  social: "Instagram/test-studio",
  lat: 37.4979,
  lng: 127.0276,
  managerName: "김관리",
  managerPhone: "010-1234-5678",
  managerEmail: "manager@test.com",
  capacity: 30,
  status: "active" as AdminStudioStatus,
  description: "테스트용 스튜디오 설명",
  operatingHours: "09:00 - 22:00",
  amenities: ["주차", "WiFi", "라커", "샤워실"],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  createdBy: "admin",
  updatedBy: "admin",
};

export const mockOfficialStudio: AdminStudioItem = {
  ...mockStudioBase,
  id: "s_official_001",
  name: "공인 스튜디오 A",
  tab: "official",
  status: "active",
};

export const mockPartnerStudio: AdminStudioItem = {
  ...mockStudioBase,
  id: "s_partner_001",
  name: "파트너 스튜디오 B",
  tab: "partner",
  status: "active",
};

export const mockAssociatedStudio: AdminStudioItem = {
  ...mockStudioBase,
  id: "s_associated_001",
  name: "협력 스튜디오 C",
  tab: "associated",
  status: "inactive",
};

export const mockInactiveStudio: AdminStudioItem = {
  ...mockStudioBase,
  id: "s_inactive_001",
  name: "운영 중지 스튜디오",
  status: "inactive",
};

export const mockMaintenanceStudio: AdminStudioItem = {
  ...mockStudioBase,
  id: "s_maintenance_001",
  name: "점검 중 스튜디오",
  status: "maintenance",
};

export const mockChinaStudio: AdminStudioItem = {
  ...mockStudioBase,
  id: "s_china_001",
  name: "北京工作室",
  country: "CN",
  city: "beijing",
  region: "朝阳区",
  address: "北京市朝阳区建国路88号",
  phone: "+86-10-1234-5678",
  lat: 39.9042,
  lng: 116.4074,
};

export const mockStudioList: AdminStudioItem[] = [
  mockOfficialStudio,
  mockPartnerStudio,
  mockAssociatedStudio,
  mockInactiveStudio,
  mockMaintenanceStudio,
  mockChinaStudio,
  // Generate more studios for pagination testing
  ...Array.from({ length: 20 }, (_, i) => ({
    ...mockStudioBase,
    id: `s_gen_${i + 1}`,
    name: `Generated Studio ${i + 1}`,
    tab: ["official", "partner", "associated"][i % 3] as StudioTab,
    status: ["active", "inactive", "maintenance"][i % 3] as AdminStudioStatus,
    updatedAt: new Date(2026, 0, i + 1).toISOString(),
  })),
];

export const mockStudioFormData: StudioFormData = {
  name: "새 스튜디오",
  tab: "official",
  country: "KR",
  city: "seoul",
  region: "강남구",
  address: "서울시 강남구 테헤란로 456",
  phone: "02-9876-5432",
  social: "Instagram/new-studio",
  lat: 37.5000,
  lng: 127.0300,
  managerName: "박담당",
  managerPhone: "010-9876-5432",
  managerEmail: "contact@new-studio.com",
  capacity: 50,
  status: "active",
  description: "새로 생성된 스튜디오",
  operatingHours: "10:00 - 23:00",
  amenities: ["주차", "WiFi", "카페", "에어컨"],
};

export const mockInvalidStudioFormData: Partial<StudioFormData> = {
  name: "", // Invalid: empty name
  tab: "official",
  country: "KR",
  city: "",  // Invalid: empty city
  region: "", // Invalid: empty region
  address: "", // Invalid: empty address
  phone: "", // Invalid: empty phone
  lat: 0, // Invalid: lat = 0
  lng: 0, // Invalid: lng = 0
};

/**
 * Factory function to create custom studio
 */
export function createMockStudio(
  overrides: Partial<AdminStudioItem> = {}
): AdminStudioItem {
  return {
    ...mockStudioBase,
    ...overrides,
    id: overrides.id || `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
  };
}

/**
 * Factory function to create custom form data
 */
export function createMockFormData(
  overrides: Partial<StudioFormData> = {}
): StudioFormData {
  return {
    ...mockStudioFormData,
    ...overrides,
  };
}

/**
 * Generate multiple studios with different configurations
 */
export function generateMockStudios(
  count: number,
  overrides: Partial<AdminStudioItem> = {}
): AdminStudioItem[] {
  return Array.from({ length: count }, (_, i) =>
    createMockStudio({
      ...overrides,
      id: `s_generated_${i + 1}`,
      name: `Studio ${i + 1}`,
      updatedAt: new Date(2026, 0, i + 1).toISOString(),
    })
  );
}
