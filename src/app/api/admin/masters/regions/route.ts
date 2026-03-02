import { NextRequest, NextResponse } from "next/server";
import { REGIONS_BY_CITY } from "@/lib/data/masterData";

/**
 * GET /api/admin/masters/regions?cityId=KR-Seoul
 * 지역 목록 조회 (도시별)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cityId = searchParams.get("cityId");

    if (!cityId) {
      return NextResponse.json(
        {
          success: false,
          error: "cityId is required",
        },
        { status: 400 }
      );
    }

    const regions = REGIONS_BY_CITY[cityId] || [];
    const response = {
      success: true,
      data: regions,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching regions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "지역 목록 조회에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
