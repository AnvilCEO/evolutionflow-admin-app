import { NextRequest, NextResponse } from "next/server";
import { ALL_CITIES } from "@/lib/data/masterData";

/**
 * GET /api/admin/masters/cities?countryCode=KR
 * 도시 목록 조회 (국가별)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const countryCode = searchParams.get("countryCode");

    if (!countryCode) {
      return NextResponse.json(
        {
          success: false,
          error: "countryCode is required",
        },
        { status: 400 }
      );
    }

    const cities = ALL_CITIES[countryCode] || [];
    const response = {
      success: true,
      data: cities,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      {
        success: false,
        error: "도시 목록 조회에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
