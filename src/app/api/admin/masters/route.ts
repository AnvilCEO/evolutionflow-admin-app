import { NextRequest, NextResponse } from "next/server";
import {
  COUNTRIES,
  ALL_CITIES,
  REGIONS_BY_CITY,
} from "@/lib/data/masterData";
import type {
  CountryMaster,
  CityMaster,
  RegionMaster,
  ExtractLocationResponse,
} from "@/types/master";

/**
 * GET /api/admin/masters
 * 마스터 데이터 조회 (국가, 도시, 지역)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const countryCode = searchParams.get("countryCode");
    const cityId = searchParams.get("cityId");

    // Default response structure
    const createResponse = (data: any) => ({
      success: true,
      data,
    });

    // By type query parameter
    if (type === "countries") {
      return NextResponse.json(createResponse(COUNTRIES));
    }

    if (type === "cities") {
      if (!countryCode) {
        return NextResponse.json(
          {
            success: false,
            error: "countryCode is required",
          },
          { status: 400 }
        );
      }
      return NextResponse.json(createResponse(ALL_CITIES[countryCode] || []));
    }

    if (type === "regions") {
      if (!cityId) {
        return NextResponse.json(
          {
            success: false,
            error: "cityId is required",
          },
          { status: 400 }
        );
      }
      return NextResponse.json(createResponse(REGIONS_BY_CITY[cityId] || []));
    }

    // If countryCode or cityId provided without type (for backward compatibility)
    if (countryCode) {
      return NextResponse.json(createResponse(ALL_CITIES[countryCode] || []));
    }

    if (cityId) {
      return NextResponse.json(createResponse(REGIONS_BY_CITY[cityId] || []));
    }

    // Default: return all master data
    return NextResponse.json(
      createResponse({
        countries: COUNTRIES,
        allCities: ALL_CITIES,
        regionsByCity: REGIONS_BY_CITY,
      })
    );
  } catch (error) {
    console.error("Error fetching master data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "마스터 데이터 조회에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}

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
