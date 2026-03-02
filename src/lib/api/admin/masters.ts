/**
 * Master Data API Functions
 * 국가, 도시, 지역 마스터 데이터 관련 API
 */

import type { CountryMaster, CityMaster, RegionMaster, ExtractLocationResponse } from "@/types/master";
import { COUNTRIES, ALL_CITIES, REGIONS_BY_CITY } from "@/lib/data/masterData";

/**
 * 국가 목록 조회
 */
export async function getCountries(): Promise<CountryMaster[]> {
  try {
    const response = await fetch("/api/admin/masters/countries", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch countries: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || COUNTRIES;
  } catch (error) {
    console.error("Error fetching countries:", error);
    // Fallback to local data
    return COUNTRIES;
  }
}

/**
 * 도시 목록 조회 (국가별)
 */
export async function getCities(countryCode: "KR" | "CN"): Promise<CityMaster[]> {
  try {
    const response = await fetch(`/api/admin/masters/cities?countryCode=${countryCode}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cities: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || ALL_CITIES[countryCode] || [];
  } catch (error) {
    console.error("Error fetching cities:", error);
    // Fallback to local data
    return ALL_CITIES[countryCode] || [];
  }
}

/**
 * 지역 목록 조회 (도시별)
 */
export async function getRegions(cityId: string): Promise<RegionMaster[]> {
  try {
    const response = await fetch(`/api/admin/masters/regions?cityId=${cityId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch regions: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || REGIONS_BY_CITY[cityId] || [];
  } catch (error) {
    console.error("Error fetching regions:", error);
    // Fallback to local data
    return REGIONS_BY_CITY[cityId] || [];
  }
}

/**
 * 주소에서 도시/지역 자동 추출
 */
export async function extractLocationFromAddress(
  countryCode: "KR" | "CN",
  address: string
): Promise<ExtractLocationResponse> {
  try {
    const response = await fetch("/api/admin/masters/extract-location", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        countryCode,
        address,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to extract location: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || { confidence: "low" };
  } catch (error) {
    console.error("Error extracting location:", error);
    return { confidence: "low" };
  }
}

/**
 * 클라이언트 사이드 주소 자동 추출 (백업용)
 * 정규표현식을 사용해 기본적인 도시/지역 추출
 */
export function extractLocationClientSide(
  countryCode: "KR" | "CN",
  address: string
): ExtractLocationResponse {
  let confidence: "high" | "medium" | "low" = "low";
  let cityName: string | undefined;
  let regionName: string | undefined;
  let cityId: string | undefined;
  let regionId: string | undefined;

  if (!address) {
    return { confidence };
  }

  if (countryCode === "KR") {
    // 한국 주소 패턴: "서울시 강남구" 또는 "서울 강남구"
    const seoulMatch = address.match(/(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/);
    if (seoulMatch) {
      cityName = seoulMatch[1];
      // 도시 ID 매핑
      const cityMap: Record<string, string> = {
        서울: "KR-Seoul",
        부산: "KR-Busan",
        대구: "KR-Daegu",
        인천: "KR-Incheon",
        광주: "KR-Gwangju",
        대전: "KR-Daejeon",
        울산: "KR-Ulsan",
        세종: "KR-Sejong",
        경기: "KR-Gyeonggi",
        강원: "KR-Gangwon",
        충북: "KR-Chungbuk",
        충남: "KR-Chungnam",
        전북: "KR-Jeonbuk",
        전남: "KR-Jeonnam",
        경북: "KR-Gyeongbuk",
        경남: "KR-Gyeongnam",
        제주: "KR-Jeju",
      };
      cityId = cityMap[cityName];
      confidence = "medium";

      // 지역명 추출 (시 아래 구/군명)
      const regionPattern = /(?:시|도|특별시|광역시)\s*(\S+(?:구|군))/;
      const regionMatch = address.match(regionPattern);
      if (regionMatch) {
        regionName = regionMatch[1];
        confidence = "high";

        // 지역 ID 매핑 (간단한 예시)
        if (cityId && regionName) {
          const regions = REGIONS_BY_CITY[cityId] || [];
          const foundRegion = regions.find((r) => r.name.includes(regionName as string));
          if (foundRegion) {
            regionId = foundRegion.id;
          }
        }
      }
    }
  } else if (countryCode === "CN") {
    // 중국 주소 패턴: "베이징시" 또는 "베이징"
    const cityPattern = /(베이징|상하이|광저우|선전|청두|우한)/;
    const cityMatch = address.match(cityPattern);
    if (cityMatch) {
      cityName = cityMatch[1];
      const cityMap: Record<string, string> = {
        베이징: "CN-Beijing",
        상하이: "CN-Shanghai",
        광저우: "CN-Guangzhou",
        선전: "CN-Shenzhen",
        청두: "CN-Chengdu",
        우한: "CN-Wuhan",
      };
      cityId = cityMap[cityName];
      confidence = "medium";

      // 지역명 추출
      const regionPattern = /(?:시)\s*(\S+(?:구))/;
      const regionMatch = address.match(regionPattern);
      if (regionMatch) {
        regionName = regionMatch[1];
        confidence = "high";

        if (cityId && regionName) {
          const regions = REGIONS_BY_CITY[cityId] || [];
          const foundRegion = regions.find((r) => r.name.includes(regionName as string));
          if (foundRegion) {
            regionId = foundRegion.id;
          }
        }
      }
    }
  }

  return {
    cityId,
    regionId,
    cityName,
    regionName,
    confidence,
  };
}
