import { NextRequest, NextResponse } from "next/server";
import { ALL_CITIES, REGIONS_BY_CITY } from "@/lib/data/masterData";
import type {
  ExtractLocationResponse,
  CityMaster,
  RegionMaster,
} from "@/types/master";

/**
 * POST /api/admin/masters/extract-location
 * 주소에서 도시, 지역 추출
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countryCode, address } = body;

    if (!countryCode || !address) {
      return NextResponse.json(
        {
          success: false,
          error: "countryCode and address are required",
        },
        { status: 400 }
      );
    }

    // Extract location using regex patterns
    const result = extractLocationFromAddress(countryCode, address);

    const response = {
      success: true,
      data: result,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error extracting location:", error);
    return NextResponse.json(
      {
        success: false,
        error: "주소 분석에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}

/**
 * 주소에서 도시, 지역 추출
 */
function extractLocationFromAddress(
  countryCode: string,
  address: string
): ExtractLocationResponse {
  const cities = ALL_CITIES[countryCode] || [];
  const regions: RegionMaster[] = [];

  let detectedCity: CityMaster | null = null;
  let detectedRegion: RegionMaster | null = null;
  let confidence: "high" | "medium" | "low" = "low";

  if (countryCode === "KR") {
    // Korean address extraction
    // Pattern: 도/시, 구, 동
    for (const city of cities) {
      if (address.includes(city.name)) {
        detectedCity = city;
        confidence = "high";
        break;
      }
    }

    if (detectedCity) {
      const cityRegions = REGIONS_BY_CITY[detectedCity.id] || [];
      for (const region of cityRegions) {
        if (address.includes(region.name)) {
          detectedRegion = region;
          break;
        }
      }
    }
  } else if (countryCode === "CN") {
    // Chinese address extraction
    // Pattern: 省/市, 区/县
    for (const city of cities) {
      if (address.includes(city.name)) {
        detectedCity = city;
        confidence = "high";
        break;
      }
    }

    if (detectedCity) {
      const cityRegions = REGIONS_BY_CITY[detectedCity.id] || [];
      for (const region of cityRegions) {
        if (address.includes(region.name)) {
          detectedRegion = region;
          break;
        }
      }
    }
  }

  return {
    cityId: detectedCity?.id,
    cityName: detectedCity?.name,
    regionId: detectedRegion?.id,
    regionName: detectedRegion?.name,
    confidence,
  };
}
