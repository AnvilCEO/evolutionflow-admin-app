import { NextRequest, NextResponse } from "next/server";
import type {
  AdminStudioItem,
  StudioFormData,
  StudioDetailResponse,
  StudioUpdateResponse,
  StudioDeleteResponse,
} from "@/types/studio";
import { studioDatabase } from "@/lib/data/studioDatabase";

/**
 * GET /api/admin/studios/[id]
 * 스튜디오 상세 조회
 */
export async function GET(
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

    const response: StudioDetailResponse = {
      success: true,
      data: studio,
    };

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
 * PUT /api/admin/studios/[id]
 * 스튜디오 정보 수정
 */
export async function PUT(
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

    const body: Partial<StudioFormData> = await request.json();

    // Validation - at least name should exist if provided
    if (body.name === "") {
      return NextResponse.json(
        {
          success: false,
          error: "스튜디오 명은 필수입니다.",
        },
        { status: 400 }
      );
    }

    // Update studio with new data
    const updatedStudio: AdminStudioItem = {
      ...studio,
      ...body,
      id: studio.id, // Don't allow ID change
      createdAt: studio.createdAt, // Don't allow creation time change
      createdBy: studio.createdBy,
      updatedAt: new Date().toISOString(),
      updatedBy: "admin", // Should come from auth context
    };

    studioDatabase[id] = updatedStudio;

    const response: StudioUpdateResponse = {
      success: true,
      data: updatedStudio,
      message: "스튜디오 정보가 저장되었습니다.",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating studio:", error);
    return NextResponse.json(
      {
        success: false,
        error: "스튜디오 정보 저장에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/studios/[id]
 * 스튜디오 삭제
 */
export async function DELETE(
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

    delete studioDatabase[id];

    const response: StudioDeleteResponse = {
      success: true,
      message: "스튜디오가 삭제되었습니다.",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error deleting studio:", error);
    return NextResponse.json(
      {
        success: false,
        error: "스튜디오 삭제에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
