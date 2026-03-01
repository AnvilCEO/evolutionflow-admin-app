"use client";

import { useEffect, useState } from "react";

import AdminTable from "../components/AdminTable";
import ActionMenu from "../components/ActionMenu";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { getAdminSchedules, ScheduleContent } from "@/lib/api/admin";
import { formatDate } from "@/lib/utils/format";

interface TripEventItem {
  id: string;
  title: string;
  classType: "SPECIAL" | "TTC" | "WORKSHOP";
  instructorName: string;
  startDate: string;
  endDate: string;
  timeInfo: string;
  locationInfo: string;
  currentApplicants: number;
  capacity: number;
  status: "OPEN" | "FULL" | "WAITLIST" | "CANCELLED";
  isActive: boolean;
}

export default function EventsPage() {
  const { accessToken, isLoading: authLoading } = useAuth();

  const [events, setEvents] = useState<TripEventItem[]>([]);
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

  useEffect(() => {
    async function fetchEvents() {
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
          page: 1,
          limit: 500,
        });

        const source = response.data.filter(
          (item) => item.classType !== "REGULAR",
        );

        const normalizedQuery = searchQuery.trim().toLowerCase();
        let filtered = source.filter((item) => {
          const matchesSearch = !normalizedQuery
            || item.className.toLowerCase().includes(normalizedQuery)
            || item.instructorName.toLowerCase().includes(normalizedQuery)
            || item.locationInfo.toLowerCase().includes(normalizedQuery);
          const matchesStatus = !statusFilter || item.status === statusFilter;
          const matchesType = !typeFilter || item.classType === typeFilter;
          return matchesSearch && matchesStatus && matchesType;
        });

        filtered.sort((a, b) => {
          const aValue = (a as unknown as Record<string, unknown>)[sortKey] ?? "";
          const bValue = (b as unknown as Record<string, unknown>)[sortKey] ?? "";
          if (sortDirection === "asc") return aValue > bValue ? 1 : -1;
          return aValue < bValue ? 1 : -1;
        });

        const mapped: TripEventItem[] = filtered.map((item: ScheduleContent) => ({
          id: item.id,
          title: item.className,
          classType: item.classType as "SPECIAL" | "TTC" | "WORKSHOP",
          instructorName: item.instructorName,
          startDate: item.startDate,
          endDate: item.endDate,
          timeInfo: item.timeInfo,
          locationInfo: item.locationInfo,
          currentApplicants: item.currentApplicants,
          capacity: item.capacity,
          status: item.status,
          isActive: item.isActive,
        }));

        const startIndex = (page - 1) * pageSize;
        const paged = mapped.slice(startIndex, startIndex + pageSize);

        setEvents(paged);
        setTotal(mapped.length);
      } catch (err: unknown) {
        const parsedError = err instanceof Error ? err : new Error(String(err));
        setError(parsedError.message || "Trip&Event 목록을 불러올 수 없습니다.");
        console.error("Failed to fetch trip-events:", err);
      } finally {
        setIsLoading(false);
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchEvents();
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [page, pageSize, searchQuery, statusFilter, typeFilter, sortKey, sortDirection, authLoading, accessToken]);

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
    setPage(1);
  };

  const statusBadge = (status: TripEventItem["status"]) => {
    if (status === "OPEN") {
      return <span className="inline-flex rounded px-2 py-1 text-xs font-medium bg-green-50 text-green-700">예약 오픈</span>;
    }
    if (status === "WAITLIST") {
      return <span className="inline-flex rounded px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700">대기 접수</span>;
    }
    if (status === "FULL") {
      return <span className="inline-flex rounded px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700">마감</span>;
    }
    return <span className="inline-flex rounded px-2 py-1 text-xs font-medium bg-red-50 text-red-700">취소됨</span>;
  };

  const typeBadge = (type: TripEventItem["classType"]) => {
    if (type === "SPECIAL") {
      return <span className="inline-flex rounded px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700">Trip & Event</span>;
    }
    if (type === "WORKSHOP") {
      return <span className="inline-flex rounded px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700">워크샵형 이벤트</span>;
    }
    return <span className="inline-flex rounded px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700">TTC</span>;
  };

  const columns: Array<{
    key: keyof TripEventItem;
    label: string;
    sortable?: boolean;
    width?: string;
    render?: (value: unknown, item: TripEventItem) => React.ReactNode;
  }> = [
    {
      key: "title",
      label: "제목",
      sortable: true,
      render: (value: unknown, item: TripEventItem) => (
        <div>
          <div className="font-semibold text-gray-900">{value as string}</div>
          <div className="mt-1 text-xs text-gray-500">{item.locationInfo}</div>
        </div>
      ),
    },
    {
      key: "classType",
      label: "유형",
      sortable: true,
      render: (value: unknown) => typeBadge(value as TripEventItem["classType"]),
    },
    {
      key: "startDate",
      label: "일정",
      sortable: true,
      render: (value: unknown, item: TripEventItem) => (
        <div>
          <div className="text-sm">{formatDate(value as string)} ~ {formatDate(item.endDate)}</div>
          <div className="mt-1 text-xs text-gray-500">{item.timeInfo}</div>
        </div>
      ),
    },
    {
      key: "currentApplicants",
      label: "예약 현황",
      sortable: true,
      render: (value: unknown, item: TripEventItem) => {
        const current = Number(value);
        return <span className="font-medium">{current} / {item.capacity}명</span>;
      },
    },
    {
      key: "status",
      label: "상태",
      sortable: true,
      render: (value: unknown) => statusBadge(value as TripEventItem["status"]),
    },
    {
      key: "id",
      label: "작업",
      width: "w-24",
      render: (value: unknown, item: TripEventItem) => (
        <ActionMenu
          items={[
            {
              label: "내용 조회",
              action: () => { window.location.href = `/admin/events/${item.id}`; },
            },
            {
              label: "스케줄 상세 편집",
              action: () => { window.location.href = `/admin/schedules/${item.id}`; },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-pretendard text-3xl font-bold text-black">Trip&Event 관리</h1>
          <p className="font-pretendard mt-2 text-gray-600">
            Trip&Event(SPECIAL) 및 TTC 항목을 조회하고 상세 내용을 확인합니다.
          </p>
        </div>
        <button
          onClick={() => { window.location.href = "/admin/schedules/new"; }}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          + Trip&Event 등록
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">검색</label>
          <input
            type="text"
            placeholder="제목, 강사, 장소 검색..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-black focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">유형</label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          >
            <option value="">전체 유형</option>
            <option value="SPECIAL">Trip&Event (SPECIAL)</option>
            <option value="WORKSHOP">워크샵형 이벤트 (WORKSHOP)</option>
            <option value="TTC">TTC</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">상태</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          >
            <option value="">전체 상태</option>
            <option value="OPEN">예약 오픈</option>
            <option value="WAITLIST">대기 접수</option>
            <option value="FULL">마감</option>
            <option value="CANCELLED">취소됨</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">&nbsp;</label>
          <button
            onClick={() => {
              setSearchQuery("");
              setTypeFilter("");
              setStatusFilter("");
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            초기화
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner message="Trip&Event 목록을 불러오는 중..." />
      ) : (
        <>
          <AdminTable
            columns={columns as never}
            data={events as never}
            rowKey="id"
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
          />

          <div className="flex items-center justify-between">
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
