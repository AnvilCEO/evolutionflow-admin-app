"use client";

import Link from "next/link";

export default function AdminDashboard() {
  const stats = [
    {
      id: "daily-visitors",
      title: "일간 방문자수",
      value: "8,924",
      change: "+15% from yesterday",
      icon: "👀",
      href: "/admin",
    },
    {
      id: "total-members",
      title: "총 회원수",
      value: "1,234",
      change: "+12% from last month",
      icon: "👥",
      href: "/admin/members",
    },
    {
      id: "active-instructors",
      title: "활성 강사",
      value: "45",
      change: "+3 new this week",
      icon: "🎓",
      href: "/admin/instructors",
    },
    {
      id: "partnership-inquiries",
      title: "제휴문의",
      value: "5",
      change: "2 unread",
      icon: "🤝",
      href: "/admin/partnerships",
    },
    {
      id: "open-workshops",
      title: "오픈된 워크샵",
      value: "89",
      change: "+5 from last week",
      icon: "📚",
      href: "/admin/workshops",
    },
    {
      id: "workshop-applicants",
      title: "워크샵 신청자수",
      value: "342",
      change: "+28 this week",
      icon: "🧘",
      href: "/admin/requests",
    },
    {
      id: "trip-event-applicants",
      title: "Trip&Event 신청자 수",
      value: "1,050",
      change: "+120 this month",
      icon: "🎟️",
      href: "/admin/events",
    },
    {
      id: "studios",
      title: "스튜디오",
      value: "12",
      change: "All operational",
      icon: "🏢",
      href: "/admin/studios",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "member",
      description: "새로운 회원 가입",
      timestamp: "2 hours ago",
      user: "김철수",
    },
    {
      id: 2,
      type: "instructor",
      description: "강사 승인 요청",
      timestamp: "4 hours ago",
      user: "이영희",
    },
    {
      id: 3,
      type: "class",
      description: "워크샵 등록",
      timestamp: "1 day ago",
      user: "박민준",
    },
    {
      id: 4,
      type: "event",
      description: "Trip&Event 추가",
      timestamp: "2 days ago",
      user: "정수진",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-pretendard text-3xl font-bold text-black">대시보드</h1>
        <p className="font-pretendard mt-2 text-gray-600">
          Evolutionflow 관리자 대시보드에 오신 것을 환영합니다.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.id} href={stat.href}>
            <div className="rounded-lg border border-gray-200 bg-white p-6 transition-all hover:shadow-lg hover:border-gray-300 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="mt-2 text-2xl font-bold text-black">{stat.value}</p>
                  <p className="mt-1 text-xs text-gray-500">{stat.change}</p>
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activities */}
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
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-b-0"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm">
                  {activity.type === "member" && "👤"}
                  {activity.type === "instructor" && "🎓"}
                  {activity.type === "class" && "📚"}
                  {activity.type === "event" && "🎉"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.user}</p>
                </div>
                <p className="text-xs text-gray-500">{activity.timestamp}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="font-pretendard text-lg font-bold text-black">빠른 작업</h2>

          <div className="mt-6 space-y-3">
            <Link href="/admin/members">
              <button className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors">
                회원 관리
              </button>
            </Link>
            <Link href="/admin/instructors">
              <button className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                강사 승인
              </button>
            </Link>
            <Link href="/admin/workshops">
              <button className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                워크샵
              </button>
            </Link>
            <Link href="/admin/studios">
              <button className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                스튜디오 관리
              </button>
            </Link>
            <Link href="/admin/events">
              <button className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Trip&Event
              </button>
            </Link>
            <Link href="/admin/partnerships">
              <button className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                제휴문의
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-pretendard text-lg font-bold text-black">시스템 상태</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <div>
              <p className="text-sm font-medium text-black">API 서버</p>
              <p className="text-xs text-gray-500">정상 작동</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <div>
              <p className="text-sm font-medium text-black">데이터베이스</p>
              <p className="text-xs text-gray-500">정상 작동</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <div>
              <p className="text-sm font-medium text-black">스토리지</p>
              <p className="text-xs text-gray-500">정상 작동</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
