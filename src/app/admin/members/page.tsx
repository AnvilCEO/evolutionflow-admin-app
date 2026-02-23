"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminTable from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import ActionMenu from "../components/ActionMenu";
import LoadingSpinner from "../components/LoadingSpinner";
import { getAdminMembers, Member } from "@/lib/api/admin";

export default function MembersPage() {
  const { accessToken, isLoading: authLoading } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [membershipFilter, setMembershipFilter] = useState<string>("");

  const [sortKey, setSortKey] = useState("registrationDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Fetch members data
  useEffect(() => {
    async function fetchMembers() {
      if (authLoading) return;
      if (!accessToken) {
        setIsLoading(false);
        setError("로그인이 필요합니다.");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await getAdminMembers(accessToken, {
          page,
          pageSize,
          search: searchQuery || undefined,
          status: statusFilter || undefined,
          membershipLevel: membershipFilter || undefined,
          sortBy: sortKey,
          sortDirection,
        });

        setMembers(response.data);
        setTotal(response.total);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error.message || "회원 목록을 불러올 수 없습니다.");
        console.error("Failed to fetch members:", err);
      } finally {
        setIsLoading(false);
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchMembers();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [page, pageSize, searchQuery, statusFilter, membershipFilter, sortKey, sortDirection, accessToken]);

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
    setPage(1);
  };

  const handleStatusChange = async (memberId: string, newStatus: "active" | "inactive" | "suspended") => {
    if (!accessToken) return;

    try {
      // API call would go here
      // await updateMemberStatus(memberId, newStatus, accessToken);

      // For now, update UI optimistically
      setMembers(members.map(m =>
        m.id === memberId ? { ...m, status: newStatus } : m
      ));
    } catch (err: unknown) {
      console.error("Failed to update member status:", err);
      setError("회원 상태를 업데이트할 수 없습니다.");
    }
  };

  const columns: Array<{
    key: keyof Member;
    label: string;
    sortable?: boolean;
    width?: string;
    render?: (value: unknown, item: Member) => React.ReactNode;
  }> = [
    {
      key: "name",
      label: "이름",
      sortable: true,
    },
    {
      key: "email",
      label: "이메일",
    },
    {
      key: "phone",
      label: "전화번호",
      render: (value: unknown) => (value as string) || "-",
    },
    {
      key: "membershipLevel",
      label: "회원등급",
      render: (value: unknown) => {
        const strValue = value as string;
        const labels: Record<string, string> = {
          general: "일반",
          instructor: "강사",
          premium: "프리미엄",
        };
        return labels[strValue] || strValue;
      },
    },
    {
      key: "status",
      label: "상태",
      render: (value: unknown) => (
        <StatusBadge status={value as "active" | "inactive" | "suspended"} />
      ),
    },
    {
      key: "registrationDate",
      label: "가입일",
      sortable: true,
      render: (value: unknown) => new Date(value as string).toLocaleDateString("ko-KR"),
    },
    {
      key: "lastLogin",
      label: "마지막 로그인",
      render: (value: unknown) => (value as string) ? new Date(value as string).toLocaleDateString("ko-KR") : "-",
    },
    {
      key: "id",
      label: "작업",
      width: "w-24",
      render: (value: unknown, item: Member) => (
        <ActionMenu
          items={[
            {
              label: "상세보기",
              action: () => window.location.href = `/admin/members/${item.id}`,
            },
            ...(item.status === "active" ? [
              {
                label: "비활성화",
                action: () => handleStatusChange(item.id, "inactive"),
              },
            ] : []),
            ...(item.status === "inactive" ? [
              {
                label: "활성화",
                action: () => handleStatusChange(item.id, "active"),
              },
            ] : []),
            ...(item.status !== "suspended" ? [
              {
                label: "정지",
                action: () => handleStatusChange(item.id, "suspended"),
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
      <div>
        <h1 className="font-pretendard text-3xl font-bold text-black">회원관리</h1>
        <p className="font-pretendard mt-2 text-gray-600">
          플랫폼의 모든 회원을 관리하고 상태를 변경할 수 있습니다.
        </p>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">검색</label>
          <input
            type="text"
            placeholder="이름, 이메일로 검색..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-black focus:outline-none"
          />
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
            <option value="">전체</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="suspended">정지됨</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">회원등급</label>
          <select
            value={membershipFilter}
            onChange={(e) => {
              setMembershipFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          >
            <option value="">전체</option>
            <option value="general">일반</option>
            <option value="instructor">강사</option>
            <option value="premium">프리미엄</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">&nbsp;</label>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("");
              setMembershipFilter("");
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
        <LoadingSpinner message="회원 목록을 불러오는 중..." />
      ) : (
        <>
          <AdminTable
            columns={columns as never}
            data={members as never}
            rowKey="id"
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
