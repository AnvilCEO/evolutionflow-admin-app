import { NextRequest, NextResponse } from "next/server";
import type {
  AdminStudioItem,
  AdminStudioStatus,
  StudioStatusUpdateResponse,
} from "@/types/studio";
import { studioDatabase } from "@/lib/data/studioDatabase";

/**
 * PATCH /api/admin/studios/[id]/status
 * 스튜디오 상태 변경
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const studio = studioDatabase[id];

    if (!studio) {
      return NextResponse.json(
        {
          success: false,
          error: "스튜디오를 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: "상태 값은 필수입니다.",
        },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses: AdminStudioStatus[] = [
      "active",
      "inactive",
      "maintenance",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "유효하지 않은 상태입니다.",
        },
        { status: 400 }
      );
    }

    // Update status
    const updatedStudio: AdminStudioItem = {
      ...studio,
      status,
      updatedAt: new Date().toISOString(),
      updatedBy: "admin", // Should come from auth context
    };

    studioDatabase[id] = updatedStudio;

    const response: StudioStatusUpdateResponse = {
      success: true,
      data: updatedStudio,
      message: "스튜디오 상태가 변경되었습니다.",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating studio status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "상태 변경에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
