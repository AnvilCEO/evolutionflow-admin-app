"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminTable from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import ActionMenu from "../components/ActionMenu";
import LoadingSpinner from "../components/LoadingSpinner";
// import { getAdminStudios, StudioItem } from "@/lib/api/admin";

// Define a placeholder type until the actual API is implemented
interface StudioItem {
  id: string;
  name: string;
  location: string;
  managerName: string;
  contact: string;
  capacity: number;
  status: "active" | "inactive" | "maintenance";
  createdAt: string;
}

export default function StudiosPage() {
  const { accessToken } = useAuth();
  const [studios, setStudios] = useState<StudioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Mock Fetch studios data
  useEffect(() => {
    async function fetchStudios() {
      if (!accessToken) return;

      try {
        setIsLoading(true);
        setError(null);

        // API call would go here
        // const response = await getAdminStudios(accessToken, { ... });

        // Mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockData: StudioItem[] = [
          { id: "s1", name: "강남 A스튜디오", location: "서울 강남구 테헤란로 123", managerName: "최관리", contact: "02-1234-5678", capacity: 30, status: "active", createdAt: "2025-01-15T00:00:00Z" },
          { id: "s2", name: "홍대 B스튜디오", location: "서울 마포구 홍익로 45", managerName: "박점장", contact: "02-9876-5432", capacity: 20, status: "active", createdAt: "2025-02-20T00:00:00Z" },
          { id: "s3", name: "판교 C스튜디오", location: "경기 성남시 분당구 판교역로 88", managerName: "이운영", contact: "031-111-2222", capacity: 40, status: "maintenance", createdAt: "2025-08-10T00:00:00Z" },
          { id: "s4", name: "부산 서면 D스튜디오", location: "부산 부산진구 서전로 9", managerName: "김팀장", contact: "051-333-4444", capacity: 25, status: "inactive", createdAt: "2025-11-05T00:00:00Z" },
        ];

        let filtered = mockData;
        if (searchQuery) {
          filtered = filtered.filter(s => s.name.includes(searchQuery) || s.location.includes(searchQuery));
        }
        if (statusFilter) {
          filtered = filtered.filter(s => s.status === statusFilter);
        }

        setStudios(filtered);
        setTotal(filtered.length);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error.message || "스튜디오 목록을 불러올 수 없습니다.");
        console.error("Failed to fetch studios:", err);
      } finally {
        setIsLoading(false);
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchStudios();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [page, pageSize, searchQuery, statusFilter, sortKey, sortDirection, accessToken]);

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
    setPage(1);
  };

  const handleStatusChange = async (studioId: string, newStatus: "active" | "inactive" | "maintenance") => {
    if (!accessToken) return;

    try {
      // API call would go here
      // await updateStudioStatus(studioId, newStatus, accessToken);

      // For now, update UI optimistically
      setStudios(studios.map(s =>
        s.id === studioId ? { ...s, status: newStatus } : s
      ));
    } catch (err: unknown) {
      console.error("Failed to update studio status:", err);
      setError("스튜디오 상태를 업데이트할 수 없습니다.");
    }
  };

  const columns: Array<{
    key: keyof StudioItem;
    label: string;
    sortable?: boolean;
    width?: string;
    render?: (value: unknown, item: StudioItem) => React.ReactNode;
  }> = [
    {
      key: "name",
      label: "스튜디오명",
      sortable: true,
      render: (value: unknown) => <span className="font-bold">{value as string}</span>
    },
    {
      key: "location",
      label: "위치",
      render: (value: unknown) => <span className="text-gray-600 truncate max-w-[200px] block" title={value as string}>{value as string}</span>
    },
    {
      key: "managerName",
      label: "담당자",
    },
    {
      key: "contact",
      label: "연락처",
    },
    {
      key: "capacity",
      label: "수용 인원",
      sortable: true,
      render: (value: unknown) => `${value}명`,
    },
    {
      key: "status",
      label: "운영 상태",
      render: (value: unknown) => {
        const status = value as "active" | "inactive" | "maintenance";
        const map: Record<string, "active" | "inactive" | "suspended"> = {
          active: "active",
          inactive: "inactive",
          maintenance: "suspended", // Reuse suspended styling for maintenance
        };
        const labels: Record<string, string> = {
            active: "운영 중",
            inactive: "운영 중지",
            maintenance: "점검 중",
        }
        return (
            <div className="flex items-center gap-2">
                <StatusBadge status={map[status]} />
                <span className="text-xs text-gray-500 hidden md:inline">{labels[status]}</span>
            </div>
        )
      },
    },
    {
      key: "id",
      label: "작업",
      width: "w-24",
      render: (value: unknown, item: StudioItem) => (
        <ActionMenu
          items={[
            {
              label: "상세보기/수정",
              action: () => alert("스튜디오 상세 페이지로 이동합니다. (구현 예정)"),
            },
            ...(item.status !== "active" ? [
              {
                label: "운영 재개",
                action: () => handleStatusChange(item.id, "active"),
              },
            ] : []),
            ...(item.status !== "inactive" ? [
              {
                label: "운영 중지",
                action: () => handleStatusChange(item.id, "inactive"),
              },
            ] : []),
            ...(item.status !== "maintenance" ? [
              {
                label: "점검 모드 전환",
                action: () => handleStatusChange(item.id, "maintenance"),
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
          <h1 className="font-pretendard text-3xl font-bold text-black">스튜디오 관리</h1>
          <p className="font-pretendard mt-2 text-gray-600">
            Evolutionflow의 모든 오프라인 스튜디오와 시설 상태를 관리합니다.
          </p>
        </div>
        <button
          onClick={() => alert("신규 스튜디오 등록 페이지로 이동합니다. (구현 예정)")}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <span>+</span> 스튜디오 등록
        </button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">검색</label>
          <input
            type="text"
            placeholder="지점명, 위치로 검색..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-black focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">운영 상태</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          >
            <option value="">전체 상태</option>
            <option value="active">운영 중</option>
            <option value="inactive">운영 중지</option>
            <option value="maintenance">시설 점검 중</option>
          </select>
        </div>

        <div>
           {/* Placeholder for layout alignment */}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">&nbsp;</label>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("");
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
        <LoadingSpinner message="스튜디오 목록을 불러오는 중..." />
      ) : (
        <>
          <AdminTable
            columns={columns as never}
            data={studios as never}
            rowKey="id"
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
          />

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              총 {total}개 지점 중 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)}개 표시
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
