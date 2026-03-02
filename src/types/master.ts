/**
 * Master Data Types - 국가, 도시, 지역 마스터 데이터
 */

export interface CountryMaster {
  code: "KR" | "CN";
  name: string;
  displayOrder: number;
}

export interface CityMaster {
  id: string;
  countryCode: "KR" | "CN";
  name: string;
  displayOrder: number;
}

export interface RegionMaster {
  id: string;
  cityId: string;
  countryCode: "KR" | "CN";
  name: string;
  displayOrder: number;
}

export interface ExtractLocationResponse {
  cityId?: string;
  regionId?: string;
  cityName?: string;
  regionName?: string;
  confidence: "high" | "medium" | "low";
}
