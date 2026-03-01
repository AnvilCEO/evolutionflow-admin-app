"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import LoadingSpinner from "@/app/admin/components/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { getAdminSchedule, ScheduleContent } from "@/lib/api/admin";
import { formatDate } from "@/lib/utils/format";

function statusLabel(status: ScheduleContent["status"]): string {
  if (status === "OPEN") return "예약 오픈";
  if (status === "WAITLIST") return "대기 접수";
  if (status === "FULL") return "마감";
  return "취소됨";
}

function classTypeLabel(type: ScheduleContent["classType"]): string {
  if (type === "SPECIAL") return "Trip & Event";
  if (type === "TTC") return "TTC";
  if (type === "WORKSHOP") return "워크샵형 이벤트";
  return "정규 클래스";
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { accessToken } = useAuth();

  const [event, setEvent] = useState<ScheduleContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEventDetail() {
      if (!accessToken || !resolvedParams.id) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await getAdminSchedule(resolvedParams.id, accessToken);
        setEvent(response.data);
      } catch (err: unknown) {
        const parsedError = err instanceof Error ? err : new Error(String(err));
        setError(parsedError.message || "Trip&Event 상세 내용을 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchEventDetail();
  }, [resolvedParams.id, accessToken]);

  if (isLoading) {
    return <LoadingSpinner message="Trip&Event 상세 정보를 불러오는 중..." />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-black"
        >
          ← 뒤로 가기
        </button>
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-black"
        >
          ← 뒤로 가기
        </button>
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          데이터를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-3 text-sm text-gray-500 hover:text-black"
          >
            ← 뒤로 가기
          </button>
          <h1 className="font-pretendard text-3xl font-bold text-black">Trip&Event 내용 조회</h1>
          <p className="mt-2 text-sm text-gray-600">ID: {event.id}</p>
        </div>
        <button
          onClick={() => { window.location.href = `/admin/schedules/${event.id}`; }}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          스케줄 상세 편집으로 이동
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">유형</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{classTypeLabel(event.classType)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">상태</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{statusLabel(event.status)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">노출 상태</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{event.isActive ? "활성" : "비활성"}</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-6">
        <section>
          <h2 className="text-lg font-bold text-gray-900">기본 정보</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">제목</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{event.className}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">강사</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{event.instructorName}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900">일정/장소</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">운영 기간</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {formatDate(event.startDate)} ~ {formatDate(event.endDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">시간</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{event.timeInfo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">운영 요일</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {event.days.length > 0 ? event.days.join(", ") : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">장소</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{event.locationInfo}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900">예약/가격</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs text-gray-500">예약 현황</p>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {event.currentApplicants} / {event.capacity}명
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">가격</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{event.price.toLocaleString()}원</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900">상세 설명</h2>
          <p className="mt-3 whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-sm text-gray-700">
            {event.classDesc || "-"}
          </p>
        </section>
      </div>
    </div>
  );
}
