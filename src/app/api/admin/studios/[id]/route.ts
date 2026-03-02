import { NextRequest, NextResponse } from "next/server";
import type { StudioFormData } from "@/types/studio";
import {
  fetchStudioFromBackend,
  updateStudioInBackend,
  deleteStudioFromBackend,
} from "@/lib/api/backend/studios";

/**
 * GET /api/admin/studios/[id]
 * 스튜디오 상세 조회
 * Proxies to backend API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");

    const response = await fetchStudioFromBackend(id, accessToken || undefined);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching studio detail:", error);
    return NextResponse.json(
      {
        success: false,
        error: "스튜디오 조회에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/studios/[id]
 * 스튜디오 정보 수정
 * Proxies to backend API
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: Partial<StudioFormData> = await request.json();

    // Validation
    if (body.name === "") {
      return NextResponse.json(
        {
          success: false,
          error: "스튜디오 명은 필수입니다.",
        },
        { status: 400 }
      );
    }

    const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");

    const response = await updateStudioInBackend(id, body, accessToken || undefined);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating studio:", error);
    const errorMsg = error instanceof Error ? error.message : "스튜디오 정보 저장에 실패했습니다.";
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/studios/[id]
 * 스튜디오 정보 수정 (for backward compatibility)
 * Proxies to backend API
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Forward to PATCH
  return PATCH(request, { params });
}

/**
 * DELETE /api/admin/studios/[id]
 * 스튜디오 삭제
 * Proxies to backend API
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");

    const response = await deleteStudioFromBackend(id, accessToken || undefined);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error deleting studio:", error);
    const errorMsg = error instanceof Error ? error.message : "스튜디오 삭제에 실패했습니다.";
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
