"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminTable from "@/app/admin/components/AdminTable";
import ActionMenu from "@/app/admin/components/ActionMenu";
import LoadingSpinner from "@/app/admin/components/LoadingSpinner";
import { getAdminInstructors, updateAdminInstructor, TeacherContent } from "@/lib/api/admin";

export default function InstructorsPage() {
  const { accessToken, isLoading: authLoading } = useAuth();
  const [instructors, setInstructors] = useState<TeacherContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("");
  const [countryFilter, setCountryFilter] = useState<string>("");

  const [sortKey, setSortKey] = useState("sortOrder");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Fetch instructors data
  useEffect(() => {
    async function fetchInstructors() {
      if (authLoading) return;
      if (!accessToken) {
        setIsLoading(false);
        setError("로그인이 필요합니다. (API 연결을 위해 인증이 필요합니다)");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch a wider range and apply deterministic client-side filtering/sorting/pagination.
        const response = await getAdminInstructors(accessToken, {
          page: 1,
          limit: 500,
        });

        const normalizedQuery = searchQuery.trim().toLowerCase();

        let filtered = response.data.filter((item) => {
          const matchesSearch = !normalizedQuery
            || item.name.toLowerCase().includes(normalizedQuery)
            || String(item.tagline ?? "").toLowerCase().includes(normalizedQuery)
            || item.code.toLowerCase().includes(normalizedQuery);

          const matchesGrade = !gradeFilter || item.grade === gradeFilter;
          const matchesCountry = !countryFilter || item.country === countryFilter;

          return matchesSearch && matchesGrade && matchesCountry;
        });

        filtered.sort((a, b) => {
          const aValue = (a as unknown as Record<string, unknown>)[sortKey];
          const bValue = (b as unknown as Record<string, unknown>)[sortKey];

          if (aValue == null && bValue == null) return 0;
          if (aValue == null) return sortDirection === "asc" ? -1 : 1;
          if (bValue == null) return sortDirection === "asc" ? 1 : -1;

          if (typeof aValue === "number" && typeof bValue === "number") {
            return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
          }

          const left = String(aValue).toLowerCase();
          const right = String(bValue).toLowerCase();
          if (left === right) return 0;

          if (sortDirection === "asc") {
            return left > right ? 1 : -1;
          }
          return left < right ? 1 : -1;
        });

        const startIndex = (page - 1) * pageSize;
        const paged = filtered.slice(startIndex, startIndex + pageSize);

        setInstructors(paged);
        setTotal(filtered.length);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error.message || "강사 목록을 불러올 수 없습니다.");
        console.error("Failed to fetch instructors:", err);
      } finally {
        setIsLoading(false);
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchInstructors();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [page, pageSize, searchQuery, gradeFilter, countryFilter, sortKey, sortDirection, authLoading, accessToken]);

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
    setPage(1);
  };

  const handleStatusChange = async (code: string, newStatus: boolean) => {
    if (!accessToken) return;

    try {
      await updateAdminInstructor(code, { isActive: newStatus }, accessToken);
      setInstructors(instructors.map(m =>
        m.code === code ? { ...m, isActive: newStatus } : m
      ));
    } catch (err: unknown) {
      console.error("Failed to update instructor status:", err);
      setError("강사 상태를 업데이트할 수 없습니다.");
    }
  };

  const columns: Array<{
    key: keyof TeacherContent;
    label: string;
    sortable?: boolean;
    width?: string;
    render?: (value: unknown, item: TeacherContent) => React.ReactNode;
  }> = [
    {
      key: "imageUrl",
      label: "사진",
      width: "w-16",
      render: (value: unknown) => (
        value ? (
          <img src={value as string} alt="프로필" className="h-10 w-10 rounded-full object-cover border border-gray-200" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
            <span className="text-gray-400 text-xs">No img</span>
          </div>
        )
      )
    },
    {
      key: "name",
      label: "이름",
      sortable: true,
      render: (value: unknown, item: TeacherContent) => (
        <div>
          <div className="font-medium text-gray-900">{value as string}</div>
          <div className="text-xs text-gray-500">{item.tagline}</div>
        </div>
      )
    },
    {
      key: "grade",
      label: "등급",
      sortable: true,
      render: (value: unknown) => (
        <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
          {value as string}
        </span>
      )
    },
    {
      key: "level",
      label: "레벨",
      sortable: true,
    },
    {
      key: "country",
      label: "국가",
      render: (value: unknown) => (value === "KR" ? "대한민국" : "중국")
    },
    {
      key: "isActive",
      label: "노출 상태",
      render: (value: unknown) => (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
          value ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/10'
        }`}>
          {value ? "활성" : "비활성"}
        </span>
      ),
    },
    {
      key: "code",
      label: "작업",
      width: "w-24",
      render: (value: unknown, item: TeacherContent) => (
        <ActionMenu
          items={[
            {
              label: "상세보기 및 편집",
              action: () => window.location.href = `/admin/instructors/${item.code}`,
            },
            {
              label: item.isActive ? "노출 비활성화" : "노출 활성화",
              action: () => handleStatusChange(item.code, !item.isActive),
              variant: item.isActive ? "danger" as const : "default" as const,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-pretendard text-3xl font-bold text-black">강사 관리</h1>
          <p className="font-pretendard mt-2 text-gray-600">
            앱에 노출되는 강사 프로필, 이력, 전문 분야 및 노출 순서를 관리합니다.
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/admin/instructors/new'}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <span>+</span> 신규 강사 등록
        </button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">검색 (이름)</label>
          <input
            type="text"
            placeholder="강사명 검색..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-black focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">등급 (Grade)</label>
          <select
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          >
            <option value="">전체</option>
            <option value="I">I (리더)</option>
            <option value="WE">WE (시니어)</option>
            <option value="EARTH">EARTH (주니어)</option>
            <option value="UNIVERSE">UNIVERSE (스페셜)</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">국가</label>
          <select
            value={countryFilter}
            onChange={(e) => {
              setCountryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          >
            <option value="">전체 (Global)</option>
            <option value="KR">대한민국 (KR)</option>
            <option value="CN">중국 (CN)</option>
          </select>
        </div>

        <div>
           <label className="mb-2 block text-sm font-medium text-gray-700">&nbsp;</label>
          <button
            onClick={() => {
              setSearchQuery("");
              setGradeFilter("");
              setCountryFilter("");
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            필터 초기화
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner message="강사 목록을 불러오는 중..." />
      ) : (
        <>
          <AdminTable
            columns={columns as never}
            data={instructors as never}
            rowKey="code"
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
          />

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              총 {total}명 중 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)}명 표시
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= total}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
