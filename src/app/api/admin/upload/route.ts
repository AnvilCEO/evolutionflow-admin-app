import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * POST /api/admin/upload
 * 파일 리퍼지토리로 이미지 단일 업로드
 * Proxies multipart formData to backend
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const accessToken = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!formData.has("file")) {
      return NextResponse.json(
        { success: false, error: "파일을 선택해주세요." },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/upload`, {
      method: "POST",
      headers: {
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      // fetch will automatically specify boundary when provided with FormData
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Backend upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Error uploading to backend:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "파일 업로드에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
