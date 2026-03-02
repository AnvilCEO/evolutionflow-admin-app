import type { CityMaster, RegionMaster } from "@/types/master";

/**
 * Test Fixtures for Master Data
 */

export const mockCountries = [
  { code: "KR", name: "한국 South Korea" },
  { code: "CN", name: "중국 China" },
];

export const mockKoreaCities: CityMaster[] = [
  { id: "seoul", name: "서울", countryCode: "KR" },
  { id: "busan", name: "부산", countryCode: "KR" },
  { id: "incheon", name: "인천", countryCode: "KR" },
  { id: "daegu", name: "대구", countryCode: "KR" },
  { id: "gwangju", name: "광주", countryCode: "KR" },
];

export const mockChinaCities: CityMaster[] = [
  { id: "beijing", name: "北京", countryCode: "CN" },
  { id: "shanghai", name: "上海", countryCode: "CN" },
  { id: "guangzhou", name: "广州", countryCode: "CN" },
  { id: "shenzhen", name: "深圳", countryCode: "CN" },
];

export const mockSeoulRegions: RegionMaster[] = [
  { id: "gangnam", name: "강남구", cityId: "seoul" },
  { id: "gangdong", name: "강동구", cityId: "seoul" },
  { id: "gangbuk", name: "강북구", cityId: "seoul" },
  { id: "gangseo", name: "강서구", cityId: "seoul" },
  { id: "gwanak", name: "관악구", cityId: "seoul" },
  { id: "gwangjin", name: "광진구", cityId: "seoul" },
  { id: "guro", name: "구로구", cityId: "seoul" },
  { id: "geumcheon", name: "금천구", cityId: "seoul" },
];

export const mockBusanRegions: RegionMaster[] = [
  { id: "haeundae", name: "해운대구", cityId: "busan" },
  { id: "suyeong", name: "수영구", cityId: "busan" },
  { id: "sasang", name: "사상구", cityId: "busan" },
  { id: "busanjin", name: "부산진구", cityId: "busan" },
];

export const mockBeijingRegions: RegionMaster[] = [
  { id: "chaoyang", name: "朝阳区", cityId: "beijing" },
  { id: "haidian", name: "海淀区", cityId: "beijing" },
  { id: "dongcheng", name: "东城区", cityId: "beijing" },
  { id: "xicheng", name: "西城区", cityId: "beijing" },
];

/**
 * Get cities by country code
 */
export function getMockCitiesByCountry(countryCode: "KR" | "CN"): CityMaster[] {
  return countryCode === "KR" ? mockKoreaCities : mockChinaCities;
}

/**
 * Get regions by city ID
 */
export function getMockRegionsByCity(cityId: string): RegionMaster[] {
  const regionMap: Record<string, RegionMaster[]> = {
    seoul: mockSeoulRegions,
    busan: mockBusanRegions,
    beijing: mockBeijingRegions,
  };
  return regionMap[cityId] || [];
}

/**
 * Mock address extraction result
 */
export interface MockLocationExtractionResult {
  confidence: "high" | "medium" | "low";
  cityId?: string;
  regionId?: string;
  message?: string;
}

export const mockAddressExtractionResults: Record<string, MockLocationExtractionResult> = {
  "서울시 강남구": {
    confidence: "high",
    cityId: "seoul",
    regionId: "gangnam",
  },
  "서울 강남": {
    confidence: "medium",
    cityId: "seoul",
  },
  "부산 해운대": {
    confidence: "high",
    cityId: "busan",
    regionId: "haeundae",
  },
  "北京市朝阳区": {
    confidence: "high",
    cityId: "beijing",
    regionId: "chaoyang",
  },
  "알 수 없는 주소": {
    confidence: "low",
    message: "주소를 파싱할 수 없습니다",
  },
};

/**
 * Factory function for mock extraction result
 */
export function createMockExtractionResult(
  address: string
): MockLocationExtractionResult {
  return (
    mockAddressExtractionResults[address] || {
      confidence: "low",
      message: "주소를 파싱할 수 없습니다",
    }
  );
}
