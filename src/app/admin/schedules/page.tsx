"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminTable from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import ActionMenu from "../components/ActionMenu";
import LoadingSpinner from "@/app/admin/components/LoadingSpinner";
import { getAdminSchedules, ScheduleContent } from "@/lib/api/admin";
import { formatDate } from "@/lib/utils/format";

export default function SchedulesPage() {
  const { accessToken, isLoading: authLoading } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const [sortKey, setSortKey] = useState("startDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  useEffect(() => {
    async function fetchSchedules() {
      if (authLoading) return;
      if (!accessToken) {
        setIsLoading(false);
        setError("로그인이 필요합니다.");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await getAdminSchedules(accessToken, {
          page,
          limit: pageSize,
          search: searchQuery || undefined,
          status: statusFilter || undefined,
          classType: typeFilter || undefined,
        });

        // Mock filtering
        let filtered = response.data;
        if (searchQuery) {
          filtered = filtered.filter((s: ScheduleContent) =>
            (s.className?.includes(searchQuery) || false) ||
            (s.instructorName?.includes(searchQuery) || false)
          );
        }
        if (statusFilter) {
          filtered = filtered.filter((s: ScheduleContent) => s.status === statusFilter);
        }
        if (typeFilter) {
          filtered = filtered.filter((s: ScheduleContent) => s.classType === typeFilter);
        }

        filtered.sort((a: ScheduleContent, b: ScheduleContent) => {
          const aValue = (a as any)[sortKey] ?? "";
          const bValue = (b as any)[sortKey] ?? "";
          if (sortDirection === "asc") {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });

        setSchedules(filtered);
        setTotal(filtered.length);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error.message || "스케줄 목록을 불러올 수 없습니다.");
        console.error("Failed to fetch schedules:", err);
      } finally {
        setIsLoading(false);
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchSchedules();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [page, pageSize, searchQuery, statusFilter, typeFilter, sortKey, sortDirection, authLoading, accessToken]);

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
    setPage(1);
  };

  const handleStatusChange = async (schId: string, newStatus: "OPEN" | "FULL" | "WAITLIST" | "CANCELLED") => {
    if (!accessToken) return;

    try {
      setSchedules(schedules.map(s =>
        s.id === schId ? { ...s, status: newStatus } : s
      ));
    } catch (err: unknown) {
      console.error("Failed to update schedule status:", err);
      setError("스케줄 상태를 업데이트할 수 없습니다.");
    }
  };

  const columns: Array<{
    key: keyof ScheduleContent;
    label: string;
    sortable?: boolean;
    width?: string;
    render?: (value: unknown, item: ScheduleContent) => React.ReactNode;
  }> = [
    {
      key: "className",
      label: "수업명/타입",
      sortable: true,
      render: (value: unknown, item: ScheduleContent) => (
        <div>
          <div className="font-medium text-gray-900">{value as string}</div>
          <div className="text-xs text-gray-500 mt-1">
            <span className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${
              item.classType === 'REGULAR' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
              item.classType === 'SPECIAL' ? 'bg-purple-50 text-purple-700 ring-purple-600/20' :
              'bg-orange-50 text-orange-700 ring-orange-600/20'
            }`}>
              {item.classType}
            </span>
          </div>
        </div>
      )
    },
    {
      key: "instructorName",
      label: "담당 강사",
      sortable: true,
    },
    {
      key: "startDate",
      label: "운영 기간 / 요일",
      sortable: true,
      render: (value: unknown, item: ScheduleContent) => (
        <div>
          <div className="text-sm">{formatDate(item.startDate)} ~ {formatDate(item.endDate)}</div>
          <div className="text-xs text-gray-500 mt-1">{item.days.join(", ")} {item.timeInfo}</div>
        </div>
      ),
    },
    {
      key: "currentApplicants",
      label: "예약 현황",
      render: (value: unknown, item: ScheduleContent) => {
        const isFull = item.currentApplicants >= item.capacity;
        return (
          <span className={`font-medium ${isFull ? "text-red-600" : "text-gray-900"}`}>
             잔여 {Math.max(0, item.capacity - item.currentApplicants)} / {item.capacity} 명
          </span>
        );
      },
    },
    {
      key: "status",
      label: "상태",
      render: (value: unknown) => {
        const status = value as "OPEN" | "FULL" | "WAITLIST" | "CANCELLED";
        const badgeMap: Record<string, "active" | "inactive" | "suspended"> = {
          OPEN: "active",
          FULL: "inactive",
          WAITLIST: "active",
          CANCELLED: "suspended",
        };
        const labelMap = {
          OPEN: "예약 오픈",
          FULL: "마감 (Full)",
          WAITLIST: "대기 접수중",
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
      render: (value: unknown, item: ScheduleContent) => (
        <ActionMenu
          items={[
            {
              label: "상세 & 수정",
              action: () => window.location.href = `/admin/schedules/${item.id}`,
            },
            ...(item.status === "OPEN" ? [
              {
                label: "마감 처리 (FULL)",
                action: () => handleStatusChange(item.id, "FULL"),
              },
              {
                label: "대기 접수 전환 (WAITLIST)",
                action: () => handleStatusChange(item.id, "WAITLIST"),
              },
              {
                label: "클래스 취소",
                action: () => handleStatusChange(item.id, "CANCELLED"),
                variant: "danger" as const,
              },
            ] : []),
            ...(item.status !== "OPEN" ? [
              {
                label: "예약 재개 (OPEN)",
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
      <div className="flex justify-between items-center bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
        <div>
          <h1 className="font-pretendard text-3xl font-bold text-black flex items-center gap-3">
            <span>📅</span> 스케줄 관리
          </h1>
          <p className="font-pretendard mt-2 text-gray-600">
            Evolutionflow Korea의 정규 클래스, 특강, 워크샵의 상세 일정을 관리합니다.
            오프라인 스튜디오에 예약 가능한 시간표를 수립하세요.
          </p>
        </div>
        <div className="flex flex-col gap-3 items-end">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                viewMode === "list"
                ? "bg-gray-100 text-black border-gray-300 z-10"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
            >
              리스트 뷰
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg border-t border-b border-r ${
                viewMode === "calendar"
                ? "bg-gray-100 text-black border-gray-300 z-10"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
            >
              달력 뷰
            </button>
          </div>
          <button
            onClick={() => window.location.href = '/admin/schedules/new'}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap"
          >
            + 새 스케줄 등록
          </button>
        </div>
      </div>

      {viewMode === "calendar" ? (
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center justify-center h-96">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="text-lg font-medium text-gray-900">달력 뷰는 현재 준비 중입니다.</h2>
          <p className="text-gray-500 mt-2">월별 전체 스케줄을 한눈에 보고 드래그 앤 드롭으로 관리할 수 있는 위젯이 추가될 예정입니다.</p>
          <button
            onClick={() => setViewMode("list")}
            className="mt-6 px-4 py-2 bg-gray-100 text-sm hover:bg-gray-200 rounded-md transition-colors"
          >
            리스트 뷰로 돌아가기
          </button>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-500 uppercase tracking-wider">검색어</label>
              <input
                type="text"
                placeholder="수업명, 담당 강사명..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm placeholder-gray-400 focus:border-black focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-500 uppercase tracking-wider">수업 유형</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-black focus:bg-white focus:outline-none transition-colors"
              >
                <option value="">전체 유형</option>
                <option value="REGULAR">정규 (Regular)</option>
                <option value="SPECIAL">특강/워크샵 (Special)</option>
                <option value="TTC">지도자과정 (TTC)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-500 uppercase tracking-wider">예약 상태</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-black focus:bg-white focus:outline-none transition-colors"
              >
                <option value="">전체 상태</option>
                <option value="OPEN">오픈 (OPEN)</option>
                <option value="FULL">마감 (FULL)</option>
                <option value="WAITLIST">대기 접수 (WAITLIST)</option>
                <option value="CANCELLED">취소됨 (CANCELLED)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("");
                  setTypeFilter("");
                  setPage(1);
                }}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
             <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 flex justify-center">
              <LoadingSpinner message="스케줄 목록을 불러오는 중..." />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <AdminTable
                columns={columns as never}
                data={schedules as never}
                rowKey="id"
                onSort={handleSort}
                sortKey={sortKey}
                sortDirection={sortDirection}
              />

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
                <p className="text-sm text-gray-600">
                  총 <span className="font-semibold text-gray-900">{total}</span>건 중 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)}건 표시
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * pageSize >= total}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
