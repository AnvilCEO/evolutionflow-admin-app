import { NextRequest, NextResponse } from "next/server";
import type {
  StudioFormData,
  StudioListResponse,
  StudioCreateResponse,
} from "@/types/studio";
import {
  fetchStudiosFromBackend,
  createStudioInBackend,
} from "@/lib/api/backend/studios";

/**
 * GET /api/admin/studios
 * 스튜디오 목록 조회 (필터링, 검색, 정렬 포함)
 * Proxies to backend API
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tab = searchParams.get("tab") || undefined;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const country = searchParams.get("country") || undefined;
    const city = searchParams.get("city") || undefined;
    const region = searchParams.get("region") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");

    // Call backend API
    const response = await fetchStudiosFromBackend(
      {
        page,
        limit: pageSize,
        tab,
        status,
        country,
        city,
        region,
        search,
      },
      accessToken || undefined
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching studios:", error);
    return NextResponse.json(
      {
        success: false,
        error: "스튜디오 목록 조회에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/studios
 * 신규 스튜디오 등록
 * Proxies to backend API
 */
export async function POST(request: NextRequest) {
  try {
    const body: StudioFormData = await request.json();

    // Validation
    if (!body.name || !body.tab || !body.country || !body.city || !body.address || !body.phone) {
      return NextResponse.json(
        {
          success: false,
          error: "필수 필드를 모두 입력해주세요.",
        },
        { status: 400 }
      );
    }

    const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");

    // Call backend API
    const response = await createStudioInBackend(body, accessToken || undefined);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating studio:", error);
    const errorMsg = error instanceof Error ? error.message : "스튜디오 등록에 실패했습니다.";
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
