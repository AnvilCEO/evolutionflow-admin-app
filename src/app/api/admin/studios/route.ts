import { NextRequest, NextResponse } from "next/server";
import type {
  AdminStudioItem,
  StudioFormData,
  StudioListResponse,
  StudioCreateResponse,
} from "@/types/studio";
import { studioDatabase } from "@/lib/data/studioDatabase";

type SortableValue = string | number | boolean | null | undefined;

/**
 * GET /api/admin/studios
 * 스튜디오 목록 조회 (필터링, 검색, 정렬 포함)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tab = searchParams.get("tab");
    const search = searchParams.get("search")?.toLowerCase();
    const status = searchParams.get("status");
    const country = searchParams.get("country");
    const city = searchParams.get("city");
    const region = searchParams.get("region");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const sortKey = searchParams.get("sortKey") || "updatedAt";
    const sortDirection = searchParams.get("sortDirection") || "desc";

    // Filter studios based on query parameters
    let filtered = Object.values(studioDatabase);

    if (tab) filtered = filtered.filter((s) => s.tab === tab);
    if (status) filtered = filtered.filter((s) => s.status === status);
    if (country) filtered = filtered.filter((s) => s.country === country);
    if (city) filtered = filtered.filter((s) => s.city === city);
    if (region) filtered = filtered.filter((s) => s.region === region);

    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.address.toLowerCase().includes(search) ||
          s.city.toLowerCase().includes(search) ||
          s.region.toLowerCase().includes(search) ||
          s.managerName.toLowerCase().includes(search)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const key = sortKey as keyof AdminStudioItem;
      let aVal = a[key] as SortableValue;
      let bVal = b[key] as SortableValue;

      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortDirection === "asc" ? 1 : -1;
      if (bVal == null) return sortDirection === "asc" ? -1 : 1;

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
      }
      if (typeof bVal === "string") {
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    // Paginate
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    const response: StudioListResponse = {
      success: true,
      data: items,
      pagination: {
        page,
        pageSize,
        total: totalCount,
        totalPages,
      },
    };

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
 */
export async function POST(request: NextRequest) {
  try {
    const body: StudioFormData = await request.json();

    // Validation
    if (!body.name || !body.tab || !body.country || !body.city || !body.region) {
      return NextResponse.json(
        {
          success: false,
          error: "필수 필드를 모두 입력해주세요.",
        },
        { status: 400 }
      );
    }

    // Generate new ID
    const newId = `s${Date.now()}`;
    const now = new Date().toISOString();

    const newStudio: AdminStudioItem = {
      id: newId,
      ...body,
      createdAt: now,
      updatedAt: now,
      createdBy: "admin", // Should come from auth context
      updatedBy: "admin",
    } as AdminStudioItem;

    // Save to database
    studioDatabase[newId] = newStudio;

    const response: StudioCreateResponse = {
      success: true,
      data: newStudio,
      message: "스튜디오가 등록되었습니다.",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating studio:", error);
    return NextResponse.json(
      {
        success: false,
        error: "스튜디오 등록에 실패했습니다.",
      },
      { status: 500 }
    );
  }
}
