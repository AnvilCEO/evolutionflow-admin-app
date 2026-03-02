/**
 * EXAMPLE: Improved Studios List Page
 *
 * This is an example showing how the studios list page should look
 * after applying the design system improvements.
 *
 * DO NOT use this file directly - it's for reference only.
 * Apply these patterns to the actual page at:
 * /src/app/admin/studios/page.tsx
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import AdminTable from "@/app/admin/components/AdminTable";
import StatusBadge from "@/app/admin/components/StatusBadge";
import ActionMenu from "@/app/admin/components/ActionMenu";
import LoadingSpinner from "@/app/admin/components/LoadingSpinner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { useToast } from "@/hooks/useToast";
import { getCities, getRegions } from "@/lib/api/admin/masters";
import { getStudios, updateStudioStatus } from "@/lib/api/admin/studios";
import { COUNTRIES } from "@/lib/data/masterData";
import type {
  AdminStudioItem,
  StudioTab,
  AdminStudioStatus,
} from "@/types/studio";
import type { CityMaster, RegionMaster } from "@/types/master";

export default function ImprovedStudiosPage() {
  const { accessToken } = useAuth();
  const toast = useToast();
  const [studios, setStudios] = useState<AdminStudioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          toast.error("스튜디오 목록을 불러올 수 없습니다.");
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        toast.error(error.message || "스튜디오 목록을 불러올 수 없습니다.");
        console.error("Failed to fetch studios:", err);
      } finally {
        setIsLoading(false);
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchStudios();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [
    page,
    pageSize,
    searchQuery,
    statusFilter,
    countryFilter,
    cityFilter,
    regionFilter,
    sortKey,
    sortDirection,
    activeTab,
    accessToken,
    toast,
  ]);

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
    setPage(1);
  };

  const handleStatusChange = async (
    studioId: string,
    newStatus: AdminStudioStatus
  ) => {
    if (!accessToken) return;

    try {
      // Optimistically update UI
      setStudios((prevStudios) =>
        prevStudios.map((s) =>
          s.id === studioId ? { ...s, status: newStatus } : s
        )
      );

      // Call API
      await updateStudioStatus(studioId, newStatus, accessToken);
      toast.success("스튜디오 상태가 업데이트되었습니다.");
    } catch (err: unknown) {
      console.error("Failed to update studio status:", err);
      toast.error("스튜디오 상태를 업데이트할 수 없습니다.");

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

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setCountryFilter("");
    setCityFilter("");
    setRegionFilter("");
    setPage(1);
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
      render: (value: unknown) => (
        <span className="font-semibold text-gray-900">{value as string}</span>
      ),
    },
    {
      key: "address",
      label: "위치",
      render: (value: unknown, item) => (
        <span
          className="text-gray-600 truncate max-w-[200px] block"
          title={value as string}
        >
          {item.city} {item.region}
        </span>
      ),
    },
    {
      key: "managerName",
      label: "담당자",
      render: (value: unknown) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "managerPhone",
      label: "연락처",
      render: (value: unknown) => (
        <span className="text-gray-600 font-mono text-sm">
          {value as string}
        </span>
      ),
    },
    {
      key: "capacity",
      label: "수용 인원",
      sortable: true,
      render: (value: unknown) => (
        <span className="text-gray-700 font-medium">{value}명</span>
      ),
    },
    {
      key: "status",
      label: "운영 상태",
      render: (value: unknown) => {
        const status = value as AdminStudioStatus;
        const labels: Record<AdminStudioStatus, string> = {
          active: "운영 중",
          inactive: "운영 중지",
          maintenance: "점검 중",
        };
        return (
          <StatusBadge
            status={status === "maintenance" ? "suspended" : status}
            label={labels[status]}
            withDot
          />
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
              action: () => (window.location.href = `/admin/studios/${item.id}`),
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
      {/* Header - Improved with better responsive layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">스튜디오 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            Evolutionflow의 모든 오프라인 스튜디오와 시설 상태를 관리합니다.
          </p>
        </div>
        <Link href="/admin/studios/new">
          <Button
            variant="primary"
            size="md"
            leftIcon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            스튜디오 등록
          </Button>
        </Link>
      </div>

      {/* Tabs - Improved with better hover states */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6" aria-label="스튜디오 분류">
          {(["official", "partner", "associated"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                handleResetFilters();
              }}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200
                ${
                  activeTab === tab
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
              aria-current={activeTab === tab ? "page" : undefined}
            >
              {tabLabels[tab]}
              {total > 0 && activeTab === tab && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs font-medium">
                  {total}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Filters - Wrapped in Card with improved layout */}
      <Card variant="default" padding="md">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search Input - Using new Input component */}
          <Input
            label="검색"
            placeholder="지점명, 위치로 검색..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            leftIcon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            }
          />

          {/* Country Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              국가
            </label>
            <select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value as "KR" | "CN" | "");
                setPage(1);
              }}
              className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black transition-all"
            >
              <option value="">전체</option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              도시
            </label>
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setPage(1);
              }}
              disabled={!countryFilter}
              className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
            >
              <option value="">전체</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Region Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              지역
            </label>
            <select
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value);
                setPage(1);
              }}
              disabled={!cityFilter}
              className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed transition-all"
            >
              <option value="">전체</option>
              {regions.map((region) => (
                <option key={region.id} value={region.name}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              상태
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as AdminStudioStatus | "");
                setPage(1);
              }}
              className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black transition-all"
            >
              <option value="">전체 상태</option>
              <option value="active">운영 중</option>
              <option value="inactive">운영 중지</option>
              <option value="maintenance">점검 중</option>
            </select>
          </div>
        </div>

        {/* Reset Button - Better positioned */}
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            필터 초기화
          </Button>
        </div>
      </Card>

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

          {/* Improved Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{total}개</span> 지점 중{" "}
              <span className="font-medium">
                {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)}
              </span>
              개 표시
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                leftIcon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                }
              >
                이전
              </Button>

              <span className="text-sm text-gray-700 px-3">
                페이지 <span className="font-medium">{page}</span> /{" "}
                <span className="font-medium">
                  {Math.ceil(total / pageSize)}
                </span>
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= total}
                rightIcon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                }
              >
                다음
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
