"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminTable from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import ActionMenu from "../components/ActionMenu";
import LoadingSpinner from "@/app/admin/components/LoadingSpinner";
import { getAdminWorkshops, WorkshopContent } from "@/lib/api/admin";
import { formatDate } from "@/lib/utils/format";

export default function WorkshopsPage() {
  const { accessToken, isLoading: authLoading } = useAuth();
  const [workshops, setWorkshops] = useState<WorkshopContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("");

  const [sortKey, setSortKey] = useState("startDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    async function fetchWorkshops() {
      if (authLoading) return;
      if (!accessToken) {
        setIsLoading(false);
        setError("로그인이 필요합니다.");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await getAdminWorkshops(accessToken, {
          page,
          limit: pageSize,
          search: searchQuery || undefined,
          status: statusFilter || undefined,
          level: levelFilter || undefined,
        });

        // Local filtering and sorting for mocked data
        let filtered = response.data;
        if (searchQuery) {
          filtered = filtered.filter((w: WorkshopContent) =>
            (w.title?.includes(searchQuery) || false) ||
            (w.instructorName?.includes(searchQuery) || false)
          );
        }
        if (statusFilter) {
          filtered = filtered.filter((w: WorkshopContent) => w.status === statusFilter);
        }
        if (levelFilter) {
          filtered = filtered.filter((w: WorkshopContent) => w.level === levelFilter);
        }

        filtered.sort((a: WorkshopContent, b: WorkshopContent) => {
          const aValue = (a as any)[sortKey] ?? "";
          const bValue = (b as any)[sortKey] ?? "";
          if (sortDirection === "asc") {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });

        setWorkshops(filtered);
        setTotal(filtered.length); // Use response.total in production
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error.message || "워크샵 목록을 불러올 수 없습니다.");
        console.error("Failed to fetch workshops:", err);
      } finally {
        setIsLoading(false);
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchWorkshops();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [page, pageSize, searchQuery, statusFilter, levelFilter, sortKey, sortDirection, accessToken]);

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
    setPage(1);
  };

  const handleStatusChange = async (wsId: string, newStatus: "OPEN" | "CLOSED" | "CANCELLED" | "COMPLETED") => {
    if (!accessToken) return;

    try {
      // API call would go here
      setWorkshops(workshops.map(w =>
        w.id === wsId ? { ...w, status: newStatus } : w
      ));
    } catch (err: unknown) {
      console.error("Failed to update workshop status:", err);
      setError("워크샵 상태를 업데이트할 수 없습니다.");
    }
  };

  const columns: Array<{
    key: keyof WorkshopContent;
    label: string;
    sortable?: boolean;
    width?: string;
    render?: (value: unknown, item: WorkshopContent) => React.ReactNode;
  }> = [
    {
      key: "title",
      label: "워크샵명",
      sortable: true,
      render: (value: unknown, item: WorkshopContent) => (
        <div>
          <div className="font-medium text-gray-900">{value as string}</div>
          <div className="text-xs text-gray-500 mt-1">{item.category} / {item.level}</div>
        </div>
      )
    },
    {
      key: "instructorName",
      label: "강사",
      sortable: true,
    },
    {
      key: "startDate",
      label: "모집 기간",
      sortable: true,
      render: (value: unknown, item: WorkshopContent) => (
        <span className="text-sm">
          {formatDate(item.startDate)} ~ {formatDate(item.endDate)}
        </span>
      ),
    },
    {
      key: "currentApplicants",
      label: "신청 인원",
      render: (value: unknown, item: WorkshopContent) => {
        const isFull = item.currentApplicants >= item.capacity;
        return (
          <span className={`font-medium ${isFull ? "text-red-600" : "text-gray-900"}`}>
            {item.currentApplicants} / {item.capacity} 명
          </span>
        );
      },
    },
    {
      key: "price",
      label: "수강료",
      sortable: true,
      render: (value: unknown) => `${(value as number).toLocaleString()}원`,
    },
    {
      key: "status",
      label: "상태",
      render: (value: unknown) => {
        const status = value as "OPEN" | "CLOSED" | "CANCELLED" | "COMPLETED";
        const badgeMap: Record<string, "active" | "inactive" | "suspended"> = {
          OPEN: "active",
          CLOSED: "inactive",
          COMPLETED: "inactive",
          CANCELLED: "suspended",
        };
        const labelMap = {
          OPEN: "모집 중",
          CLOSED: "모감됨",
          COMPLETED: "진행 완료",
          CANCELLED: "취소됨",
        };

        return (
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
            badgeMap[status] === "active" ? 'bg-green-50 text-green-700 ring-green-600/20' :
            badgeMap[status] === "suspended" ? 'bg-red-50 text-red-700 ring-red-600/10' :
            'bg-gray-50 text-gray-600 ring-gray-500/10'
          }`}>
            {labelMap[status]}
          </span>
        );
      },
    },
    {
      key: "id",
      label: "작업",
      width: "w-24",
      render: (value: unknown, item: WorkshopContent) => (
        <ActionMenu
          items={[
            {
              label: "상세보기 및 편집",
              action: () => window.location.href = `/admin/workshops/${item.id}`,
            },
            ...(item.status === "OPEN" ? [
              {
                label: "모집 마감 처리",
                action: () => handleStatusChange(item.id, "CLOSED"),
              },
              {
                label: "워크샵 취소",
                action: () => handleStatusChange(item.id, "CANCELLED"),
                variant: "danger" as const,
              },
            ] : []),
            ...(item.status === "CANCELLED" || item.status === "CLOSED" ? [
              {
                label: "모집 재개 (OPEN)",
                action: () => handleStatusChange(item.id, "OPEN"),
              },
            ] : []),
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
          <h1 className="font-pretendard text-3xl font-bold text-black">워크샵 관리</h1>
          <p className="font-pretendard mt-2 text-gray-600">
            단발성 및 소수 정예 집중 워크샵 프로그램의 세부 정보와 일정을 관리합니다.
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/admin/workshops/new'}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          + 신규 워크샵 개설
        </button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">검색 (워크샵명, 강사명)</label>
          <input
            type="text"
            placeholder="검색어 입력..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-black focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">진행 상태</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          >
            <option value="">전체 상태</option>
            <option value="OPEN">모집 중 (OPEN)</option>
            <option value="CLOSED">모집 마감 (CLOSED)</option>
            <option value="COMPLETED">진행 완료 (COMPLETED)</option>
            <option value="CANCELLED">취소됨 (CANCELLED)</option>
          </select>
        </div>

        <div>
           <label className="mb-2 block text-sm font-medium text-gray-700">난이도 (Level)</label>
           <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          >
            <option value="">전체 난이도</option>
            <option value="ALL">전체 (All levels)</option>
            <option value="BEGINNER">초급 (Beginner)</option>
            <option value="INTERMEDIATE">중급 (Intermediate)</option>
            <option value="ADVANCED">고급 (Advanced)</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">&nbsp;</label>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("");
              setLevelFilter("");
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            초기화
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
        <LoadingSpinner message="워크샵 목록을 불러오는 중..." />
      ) : (
        <>
          <AdminTable
            columns={columns as never}
            data={workshops as never}
            rowKey="id"
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
          />

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              총 {total}건 중 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)}건 표시
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
