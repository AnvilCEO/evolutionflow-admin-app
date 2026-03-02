import { NextRequest, NextResponse } from "next/server";
import { COUNTRIES } from "@/lib/data/masterData";

/**
 * GET /api/admin/masters/countries
 * 국가 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const response = {
      success: true,
      data: COUNTRIES,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching countries:", error);
    return NextResponse.json(
      {
        success: false,
        error: "국가 목록 조회에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
