"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import {
  DashboardSnapshot,
  getAdminDashboardSnapshot,
} from "@/lib/api/dashboard";

function formatCount(value: number): string {
  return value.toLocaleString("ko-KR");
}

function formatTimestamp(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR");
}

export default function AdminDashboard() {
  const { accessToken, isLoading: authLoading } = useAuth();
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!accessToken) {
      setIsLoading(false);
      setError("로그인이 필요합니다.");
      return;
    }

    let cancelled = false;

    const fetchDashboard = async () => {
      try {
        setError(null);
        setIsLoading(true);

        const nextSnapshot = await getAdminDashboardSnapshot(accessToken);
        if (cancelled) return;

        setSnapshot(nextSnapshot);
      } catch (fetchError) {
        if (cancelled) return;
        const nextError =
          fetchError instanceof Error
            ? fetchError.message
            : "대시보드 데이터를 불러오지 못했습니다.";
        setError(nextError);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchDashboard();
    const timer = window.setInterval(() => {
      void fetchDashboard();
    }, 60_000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [accessToken, authLoading]);

  const metrics = snapshot?.metrics;

  const stats = useMemo(
    () => [
      {
        id: "total-members",
        title: "총 회원수",
        value: metrics ? formatCount(metrics.totalMembers) : "-",
        icon: "👥",
        href: "/admin/members",
      },
      {
        id: "registered-instructors",
        title: "등록 강사수",
        value: metrics ? formatCount(metrics.totalInstructors) : "-",
        icon: "🎓",
        href: "/admin/instructors",
      },
      {
        id: "partnership-inquiries",
        title: "제휴문의",
        value: metrics ? formatCount(metrics.totalPartnershipInquiries) : "-",
        icon: "🤝",
        href: "/admin/inquiries",
      },
      {
        id: "workshops",
        title: "워크샵",
        value: metrics ? formatCount(metrics.totalWorkshops) : "-",
        icon: "📚",
        href: "/admin/workshops",
      },
      {
        id: "workshop-requests",
        title: "워크샵 신청",
        value: metrics ? formatCount(metrics.totalWorkshopRequests) : "-",
        icon: "🧘",
        href: "/admin/requests",
      },
      {
        id: "trip-event-applications",
        title: "Trip&Event 신청",
        value: metrics ? formatCount(metrics.totalTripEventApplications) : "-",
        icon: "🎟️",
        href: "/admin/events",
      },
      {
        id: "studios",
        title: "스튜디오",
        value: metrics ? formatCount(metrics.totalStudios) : "-",
        icon: "🏢",
        href: "/admin/studios",
      },
      {
        id: "schedules",
        title: "스케줄",
        value: metrics ? formatCount(metrics.totalSchedules) : "-",
        icon: "📅",
        href: "/admin/schedules",
      },
    ],
    [metrics],
  );

  const recentActivities = snapshot?.recentActivities ?? [];
  const failedSources = snapshot?.failedSources ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-pretendard text-3xl font-bold text-black">대시보드</h1>
        <p className="font-pretendard mt-2 text-gray-600">
          실시간 운영 지표를 확인할 수 있습니다. (1분 주기 자동 갱신)
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {!error && failedSources.length > 0 && (
        <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-700">
          일부 지표를 불러오지 못했습니다. ({failedSources.join(", ")})
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.id} href={stat.href}>
            <div className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="mt-2 text-2xl font-bold text-black">{stat.value}</p>
                  <p className="mt-1 text-xs text-gray-500">실시간 데이터</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-pretendard text-lg font-bold text-black">최근 활동</h2>
            <Link
              href="/admin/members"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              모두 보기 →
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {isLoading && !snapshot && (
              <p className="text-sm text-gray-500">불러오는 중...</p>
            )}

            {!isLoading && recentActivities.length === 0 && (
              <p className="text-sm text-gray-500">최근 활동이 없습니다.</p>
            )}

            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-b-0"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm">
                  👤
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">{activity.user}</p>
                </div>
                <p className="text-xs text-gray-500">
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="font-pretendard text-lg font-bold text-black">빠른 작업</h2>

          <div className="mt-6 space-y-3">
            <Link href="/admin/members">
              <button className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800">
                회원 관리
              </button>
            </Link>
            <Link href="/admin/instructors">
              <button className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                강사 관리
              </button>
            </Link>
            <Link href="/admin/workshops">
              <button className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                워크샵 관리
              </button>
            </Link>
            <Link href="/admin/studios">
              <button className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                스튜디오 관리
              </button>
            </Link>
            <Link href="/admin/events">
              <button className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                Trip&Event
              </button>
            </Link>
            <Link href="/admin/boards">
              <button className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                게시판 관리
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
