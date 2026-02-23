"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminTable from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import ActionMenu from "../components/ActionMenu";
import LoadingSpinner from "../components/LoadingSpinner";

// Define a placeholder type until the actual API is implemented
interface EventItem {
  id: string;
  title: string;
  type: "banner" | "popup" | "promotion";
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "ended" | "draft";
  clickCount: number;
}

export default function EventsPage() {
  const { accessToken } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
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

  // Mock Fetch events data
  useEffect(() => {
    async function fetchEvents() {
      if (!accessToken) return;

      try {
        setIsLoading(true);
        setError(null);

        // API call would go here

        // Mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const mockData: EventItem[] = [
          { id: "e1", title: "신규 강사 모집 배너", type: "banner", startDate: now.toISOString(), endDate: nextWeek.toISOString(), status: "active", clickCount: 1240 },
          { id: "e2", title: "봄맞이 수강 할인 이벤트", type: "promotion", startDate: now.toISOString(), endDate: nextWeek.toISOString(), status: "active", clickCount: 532 },
          { id: "e3", title: "앱 업데이트 공지 팝업", type: "popup", startDate: nextWeek.toISOString(), endDate: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), status: "scheduled", clickCount: 0 },
          { id: "e4", title: "2025년 연말 결산 리포트", type: "banner", startDate: lastMonth.toISOString(), endDate: now.toISOString(), status: "ended", clickCount: 8900 },
          { id: "e5", title: "추석 연휴 휴무 안내", type: "popup", startDate: nextWeek.toISOString(), endDate: nextWeek.toISOString(), status: "draft", clickCount: 0 },
        ];

        let filtered = mockData;
        if (searchQuery) {
          filtered = filtered.filter(e => e.title.includes(searchQuery));
        }
        if (statusFilter) {
          filtered = filtered.filter(e => e.status === statusFilter);
        }
        if (typeFilter) {
          filtered = filtered.filter(e => e.type === typeFilter);
        }

        setEvents(filtered);
        setTotal(filtered.length);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error.message || "Trip&Event 목록을 불러올 수 없습니다.");
        console.error("Failed to fetch events:", err);
      } finally {
        setIsLoading(false);
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchEvents();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [page, pageSize, searchQuery, statusFilter, typeFilter, sortKey, sortDirection, accessToken]);

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
    setPage(1);
  };

  const handleStatusChange = async (eventId: string, newStatus: "active" | "scheduled" | "ended" | "draft") => {
    if (!accessToken) return;

    try {
      // API call would go here
      // For now, update UI optimistically
      setEvents(events.map(e =>
        e.id === eventId ? { ...e, status: newStatus } : e
      ));
    } catch (err: unknown) {
      console.error("Failed to update event status:", err);
      setError("Trip&Event 상태를 업데이트할 수 없습니다.");
    }
  };

  const columns: Array<{
    key: keyof EventItem;
    label: string;
    sortable?: boolean;
    width?: string;
    render?: (value: unknown, item: EventItem) => React.ReactNode;
  }> = [
    {
      key: "title",
      label: "캠페인/이벤트명",
      sortable: true,
      render: (value: unknown) => <span className="font-bold">{value as string}</span>
    },
    {
      key: "type",
      label: "유형",
      render: (value: unknown) => {
        const typeMap: Record<string, string> = {
            banner: "메인 배너",
            popup: "팝업 공지",
            promotion: "기획전/프로모션",
        };
        const colors: Record<string, string> = {
            banner: "bg-blue-100 text-blue-800",
            popup: "bg-purple-100 text-purple-800",
            promotion: "bg-orange-100 text-orange-800",
        };
        const type = value as string;
        return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[type]}`}>{typeMap[type]}</span>;
      }
    },
    {
      key: "startDate",
      label: "노출 기간",
      sortable: true,
      render: (value: unknown, item: EventItem) => {
        const start = new Date(value as string).toLocaleDateString("ko-KR");
        const end = new Date(item.endDate).toLocaleDateString("ko-KR");
        return <span className="text-sm">{start} ~ {end}</span>;
      },
    },
    {
      key: "clickCount",
      label: "조회/클릭수",
      sortable: true,
      render: (value: unknown) => <span className="font-medium text-gray-700">{Number(value).toLocaleString()}</span>
    },
    {
      key: "status",
      label: "상태",
      render: (value: unknown) => {
        const status = value as "active" | "scheduled" | "ended" | "draft";
        const map: Record<string, "active" | "inactive" | "suspended"> = {
          active: "active",
          scheduled: "inactive",
          ended: "inactive",
          draft: "suspended",
        };
        const labels: Record<string, string> = {
            active: "진행 중",
            scheduled: "진행 예정",
            ended: "종료됨",
            draft: "작성 중",
        };
        return (
            <div className="flex items-center gap-2">
                <StatusBadge status={map[status]} />
                <span className="text-xs text-gray-500 hidden md:inline">{labels[status]}</span>
            </div>
        );
      },
    },
    {
      key: "id",
      label: "작업",
      width: "w-24",
      render: (value: unknown, item: EventItem) => (
        <ActionMenu
          items={[
            {
              label: "수정하기",
              action: () => alert("Trip&Event 수정 페이지로 이동합니다. (구현 예정)"),
            },
            ...(item.status === "draft" ? [
              {
                label: "게시하기",
                action: () => handleStatusChange(item.id, "active"),
              },
            ] : []),
            ...(item.status === "active" || item.status === "scheduled" ? [
              {
                label: "강제 종료",
                action: () => handleStatusChange(item.id, "ended"),
                variant: "danger" as const,
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
          <h1 className="font-pretendard text-3xl font-bold text-black">Trip&Event 관리</h1>
          <p className="font-pretendard mt-2 text-gray-600">
            앱 및 웹사이트에 노출되는 트립, 배너, 팝업, 프로모션 이벤트를 관리합니다.
          </p>
        </div>
        <button
          onClick={() => alert("신규 Trip&Event 등록 페이지로 이동합니다. (구현 예정)")}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <span>+</span> Trip&Event 등록
        </button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">검색</label>
          <input
            type="text"
            placeholder="캠페인 명으로 검색..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-black focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">노출 위치 (유형)</label>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          >
            <option value="">전체 유형</option>
            <option value="banner">메인 배너</option>
            <option value="popup">팝업 공지</option>
            <option value="promotion">기획전/프로모션</option>
          </select>
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
            <option value="active">진행 중 (노출 중)</option>
            <option value="scheduled">진행 예정</option>
            <option value="ended">종료됨</option>
            <option value="draft">작성 중 (미노출)</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">&nbsp;</label>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("");
              setTypeFilter("");
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

          {/* Pagination */}
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
