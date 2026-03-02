"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import AdminTable from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import ActionMenu from "../components/ActionMenu";
import LoadingSpinner from "../components/LoadingSpinner";
import { getCities, getRegions } from "@/lib/api/admin/masters";
import { getStudios, updateStudioStatus } from "@/lib/api/admin/studios";
import { COUNTRIES } from "@/lib/data/masterData";
import type {
  AdminStudioItem,
  StudioTab,
  AdminStudioStatus,
} from "@/types/studio";
import type { CityMaster, RegionMaster } from "@/types/master";

export default function StudiosPage() {
  const { accessToken } = useAuth();
  const [studios, setStudios] = useState<AdminStudioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab & Filters
  const [activeTab, setActiveTab] = useState<StudioTab>("official");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminStudioStatus | "">("");
  const [countryFilter, setCountryFilter] = useState<"KR" | "CN" | "">("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [regionFilter, setRegionFilter] = useState<string>("");

  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Master Data
  const [cities, setCities] = useState<CityMaster[]>([]);
  const [regions, setRegions] = useState<RegionMaster[]>([]);

  // Load cities when country changes
  useEffect(() => {
    if (countryFilter) {
      getCities(countryFilter as "KR" | "CN").then(setCities);
      setCityFilter("");
      setRegionFilter("");
    }
  }, [countryFilter]);

  // Load regions when city changes
  useEffect(() => {
    if (cityFilter) {
      getRegions(cityFilter).then(setRegions);
      setRegionFilter("");
    }
  }, [cityFilter]);

  // Fetch studios data
  useEffect(() => {
    async function fetchStudios() {
      if (!accessToken) return;

      try {
        setIsLoading(true);
        setError(null);

        // Call actual API
        const response = await getStudios(
          {
            tab: activeTab,
            page,
            pageSize,
            search: searchQuery,
            status: statusFilter || undefined,
            country: countryFilter || undefined,
            city: cityFilter || undefined,
            region: regionFilter || undefined,
            sortKey,
            sortDirection,
          },
          accessToken
        );

        if (response.success) {
          setStudios(response.data);
          setTotal(response.pagination?.total || 0);
        } else {
          setError("스튜디오 목록을 불러올 수 없습니다.");
        }
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
  }, [page, pageSize, searchQuery, statusFilter, countryFilter, cityFilter, regionFilter, sortKey, sortDirection, activeTab, accessToken]);

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
    setPage(1);
  };

  const handleStatusChange = async (studioId: string, newStatus: AdminStudioStatus) => {
    if (!accessToken) return;

    try {
      // Optimistically update UI
      setStudios((prevStudios) =>
        prevStudios.map((s) => (s.id === studioId ? { ...s, status: newStatus } : s))
      );

      // Call API
      await updateStudioStatus(studioId, newStatus, accessToken);
    } catch (err: unknown) {
      console.error("Failed to update studio status:", err);
      setError("스튜디오 상태를 업데이트할 수 없습니다.");
      // Refresh data on error
      const response = await getStudios(
        {
          tab: activeTab,
          page,
          pageSize,
          search: searchQuery,
          status: statusFilter || undefined,
          country: countryFilter || undefined,
          city: cityFilter || undefined,
          region: regionFilter || undefined,
          sortKey,
          sortDirection,
        },
        accessToken
      );
      if (response.success) {
        setStudios(response.data);
      }
    }
  };

  const columns: Array<{
    key: keyof AdminStudioItem;
    label: string;
    sortable?: boolean;
    width?: string;
    render?: (value: unknown, item: AdminStudioItem) => React.ReactNode;
  }> = [
    {
      key: "name",
      label: "스튜디오명",
      sortable: true,
      render: (value: unknown) => <span className="font-bold">{value as string}</span>,
    },
    {
      key: "address",
      label: "위치",
      render: (value: unknown, item) => (
        <span className="text-gray-600 truncate max-w-[200px] block" title={value as string}>
          {item.city} {item.region}
        </span>
      ),
    },
    {
      key: "managerName",
      label: "담당자",
    },
    {
      key: "managerPhone",
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
        const status = value as AdminStudioStatus;
        const map: Record<AdminStudioStatus, "active" | "inactive" | "suspended"> = {
          active: "active",
          inactive: "inactive",
          maintenance: "suspended",
        };
        const labels: Record<AdminStudioStatus, string> = {
          active: "운영 중",
          inactive: "운영 중지",
          maintenance: "점검 중",
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
      render: (value: unknown, item: AdminStudioItem) => (
        <ActionMenu
          items={[
            {
              label: "상세보기/수정",
              action: () => window.location.href = `/admin/studios/${item.id}`,
            },
            ...(item.status !== "active"
              ? [
                  {
                    label: "운영 재개",
                    action: () => handleStatusChange(item.id, "active"),
                  },
                ]
              : []),
            ...(item.status !== "inactive"
              ? [
                  {
                    label: "운영 중지",
                    action: () => handleStatusChange(item.id, "inactive"),
                  },
                ]
              : []),
            ...(item.status !== "maintenance"
              ? [
                  {
                    label: "점검 모드 전환",
                    action: () => handleStatusChange(item.id, "maintenance"),
                    variant: "danger" as const,
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  const tabLabels: Record<StudioTab, string> = {
    official: "공인",
    partner: "파트너",
    associated: "협력",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-pretendard text-3xl font-bold text-black">스튜디오 관리</h1>
          <p className="font-pretendard mt-2 text-gray-600">Evolutionflow의 모든 오프라인 스튜디오와 시설 상태를 관리합니다.</p>
        </div>
        <Link
          href="/admin/studios/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors flex items-center gap-2 w-fit"
        >
          <span>+</span> 스튜디오 등록
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(["official", "partner", "associated"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSearchQuery("");
              setStatusFilter("");
              setCountryFilter("");
              setCityFilter("");
              setRegionFilter("");
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-5">
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
          <label className="mb-2 block text-sm font-medium text-gray-700">국가</label>
          <select
            value={countryFilter}
            onChange={(e) => {
              setCountryFilter(e.target.value as "KR" | "CN" | "");
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          >
            <option value="">전체</option>
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">도시</label>
          <select
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setPage(1);
            }}
            disabled={!countryFilter}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="">전체</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">지역</label>
          <select
            value={regionFilter}
            onChange={(e) => {
              setRegionFilter(e.target.value);
              setPage(1);
            }}
            disabled={!cityFilter}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="">전체</option>
            {regions.map((region) => (
              <option key={region.id} value={region.name}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">상태</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as AdminStudioStatus | "");
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          >
            <option value="">전체 상태</option>
            <option value="active">운영 중</option>
            <option value="inactive">운영 중지</option>
            <option value="maintenance">점검 중</option>
          </select>
        </div>
      </div>

      <button
        onClick={() => {
          setSearchQuery("");
          setStatusFilter("");
          setCountryFilter("");
          setCityFilter("");
          setRegionFilter("");
          setPage(1);
        }}
        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        초기화
      </button>

      {/* Error Alert */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
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
