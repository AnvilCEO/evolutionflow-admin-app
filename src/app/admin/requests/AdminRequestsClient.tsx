"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import {
  getAllTeacherRequests,
  getAllWorkshopRequests,
  getAllScheduleRequests,
  approveTeacherRequest,
  rejectTeacherRequest,
  approveWorkshopRequest,
  rejectWorkshopRequest,
  approveScheduleRequest,
  rejectScheduleRequest,
} from "@/lib/api/requests";

type Tab = "teacher" | "workshop" | "tripevent";
type Status = "all" | "pending" | "approved" | "rejected";

interface RequestItem {
  id: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  user: { id: string; email: string; name?: string };
  [key: string]: any;
}

export default function AdminRequestsClient() {
  const { user, isLoading, accessToken } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("teacher");
  const [statusFilter, setStatusFilter] = useState<Status>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [teacherRequests, setTeacherRequests] = useState<RequestItem[]>([]);
  const [workshopRequests, setWorkshopRequests] = useState<RequestItem[]>([]);
  const [tripEventRequests, setTripEventRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  // 권한 확인
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  // 데이터 로드
  useEffect(() => {
    if (!accessToken || !user || user.role !== "ADMIN") return;

    const fetchRequests = async () => {
      setLoading(true);
      setError("");
      try {
        if (activeTab === "teacher") {
          const res = await getAllTeacherRequests(accessToken);
          setTeacherRequests(res.data);
        } else if (activeTab === "workshop") {
          const res = await getAllWorkshopRequests(accessToken);
          setWorkshopRequests(res.data);
        } else if (activeTab === "tripevent") {
          const res = await getAllScheduleRequests(accessToken);
          setTripEventRequests(res.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "데이터를 불러올 수 없습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [activeTab, accessToken, user]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    setActionError("");
    try {
      if (activeTab === "teacher") {
        await approveTeacherRequest(id, accessToken!);
        setTeacherRequests((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, status: "approved" } : req
          )
        );
      } else if (activeTab === "workshop") {
        await approveWorkshopRequest(id, accessToken!);
        setWorkshopRequests((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, status: "approved" } : req
          )
        );
      } else if (activeTab === "tripevent") {
        await approveScheduleRequest(id, accessToken!);
        setTripEventRequests((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, status: "approved" } : req
          )
        );
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "승인에 실패했습니다."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    setActionError("");
    try {
      if (activeTab === "teacher") {
        await rejectTeacherRequest(id, accessToken!);
        setTeacherRequests((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, status: "rejected" } : req
          )
        );
      } else if (activeTab === "workshop") {
        await rejectWorkshopRequest(id, accessToken!);
        setWorkshopRequests((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, status: "rejected" } : req
          )
        );
      } else if (activeTab === "tripevent") {
        await rejectScheduleRequest(id, accessToken!);
        setTripEventRequests((prev) =>
          prev.map((req) =>
            req.id === id ? { ...req, status: "rejected" } : req
          )
        );
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "거절에 실패했습니다."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getFilteredRequests = (requests: RequestItem[]) => {
    let filtered = requests;

    // 상태 필터링
    if (statusFilter !== "all") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    // 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((req) => {
        const name = (req.name || "").toLowerCase();
        const email = (req.user?.email || "").toLowerCase();
        const title = (req.title || "").toLowerCase();
        const className = (req.className || "").toLowerCase();
        const instructorName = (req.instructorName || "").toLowerCase();

        return (
          name.includes(query) ||
          email.includes(query) ||
          title.includes(query) ||
          className.includes(query) ||
          instructorName.includes(query)
        );
      });
    }

    return filtered;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="text-yellow-600 bg-yellow-50 px-3 py-1 rounded text-sm font-bold">
            심사중
          </span>
        );
      case "approved":
        return (
          <span className="text-green-600 bg-green-50 px-3 py-1 rounded text-sm font-bold">
            승인
          </span>
        );
      case "rejected":
        return (
          <span className="text-red-600 bg-red-50 px-3 py-1 rounded text-sm font-bold">
            거절
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white">
        <p className="font-pretendard text-[15px] text-[#7a7a7a]">로딩 중...</p>
      </main>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  const filteredTeacherRequests = getFilteredRequests(teacherRequests);
  const filteredWorkshopRequests = getFilteredRequests(workshopRequests);
  const filteredTripEventRequests = getFilteredRequests(tripEventRequests);

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <section className="relative w-full pt-[120px] pb-10 md:pt-[150px] md:pb-20">
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8">
          <h1 className="font-pretendard text-[32px] font-bold leading-tight tracking-tight text-black md:text-[40px]">
            신청 관리
          </h1>
          <p className="font-pretendard mt-4 text-[15px] text-[#7a7a7a] md:text-[16px]">
            사용자의 강사, 워크샵, 스케줄 신청을 관리합니다.
          </p>
        </div>
      </section>

      <section className="w-full pb-20">
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8">
          {/* 탭 */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-[#e5e5e5] pb-4">
            {(["teacher", "workshop", "tripevent"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setStatusFilter("all");
                }}
                className={`font-pretendard px-4 py-2 text-[14px] font-bold transition-colors ${
                  activeTab === tab
                    ? "text-black border-b-2 border-black"
                    : "text-[#7a7a7a] hover:text-black"
                }`}
              >
                {tab === "teacher" && "강사 신청"}
                {tab === "workshop" && "워크샵 신청"}
                {tab === "tripevent" && "트립&이벤트 신청"}
              </button>
            ))}
          </div>

          {/* 검색 및 필터 */}
          <div className="mb-6">
            {/* 검색 입력 */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="이름, 이메일, 제목 등으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-[#e5e5e5] rounded font-pretendard text-[14px] focus:outline-none focus:border-black"
              />
            </div>

            {/* 상태 필터 */}
            <div className="flex flex-wrap gap-2">
              {(["all", "pending", "approved", "rejected"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`font-pretendard px-4 py-2 text-[13px] font-bold rounded transition-colors ${
                    statusFilter === status
                      ? "bg-black text-white"
                      : "bg-[#f5f5f5] text-black hover:bg-[#e5e5e5]"
                  }`}
                >
                  {status === "all" && "전체"}
                  {status === "pending" && "심사중"}
                  {status === "approved" && "승인"}
                  {status === "rejected" && "거절"}
                </button>
              ))}
            </div>
          </div>

          {/* 검색 결과 요약 */}
          {searchQuery && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="font-pretendard text-[14px] text-blue-600">
                검색 결과: <span className="font-bold">{
                  activeTab === "teacher"
                    ? getFilteredRequests(teacherRequests).length
                    : activeTab === "workshop"
                    ? getFilteredRequests(workshopRequests).length
                    : getFilteredRequests(tripEventRequests).length
                }</span>건
              </p>
            </div>
          )}

          {actionError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
              <p className="font-pretendard text-[14px] text-red-600">{actionError}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
              <p className="font-pretendard text-[14px] text-red-600">{error}</p>
            </div>
          )}

          {loading ? (
            <p className="font-pretendard text-[15px] text-[#7a7a7a] py-8 text-center">
              로딩 중...
            </p>
          ) : (
            <>
              {activeTab === "teacher" && filteredTeacherRequests.length === 0 && (
                <p className="font-pretendard text-[15px] text-[#7a7a7a] py-8 text-center">
                  신청이 없습니다.
                </p>
              )}

              {activeTab === "workshop" && filteredWorkshopRequests.length === 0 && (
                <p className="font-pretendard text-[15px] text-[#7a7a7a] py-8 text-center">
                  신청이 없습니다.
                </p>
              )}

              {activeTab === "tripevent" && filteredTripEventRequests.length === 0 && (
                <p className="font-pretendard text-[15px] text-[#7a7a7a] py-8 text-center">
                  신청이 없습니다.
                </p>
              )}

              {/* 강사 신청 목록 */}
              {activeTab === "teacher" &&
                filteredTeacherRequests.map((req) => (
                  <div
                    key={req.id}
                    className="mb-4 p-6 border border-[#e5e5e5] rounded-lg"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-pretendard text-[16px] font-bold text-black">
                            {req.name}
                          </h3>
                          {getStatusBadge(req.status)}
                        </div>
                        <div className="font-pretendard text-[13px] text-[#7a7a7a] space-y-1">
                          <p>이메일: {req.user.email}</p>
                          <p>연락처: {req.phone}</p>
                          <p>신청일: {new Date(req.createdAt).toLocaleDateString("ko-KR")}</p>
                        </div>
                      </div>

                      {req.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(req.id)}
                            disabled={actionLoading === req.id}
                          >
                            {actionLoading === req.id ? "처리중..." : "승인"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(req.id)}
                            disabled={actionLoading === req.id}
                          >
                            {actionLoading === req.id ? "처리중..." : "거절"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              {/* 워크샵 신청 목록 */}
              {activeTab === "workshop" &&
                filteredWorkshopRequests.map((req) => (
                  <div
                    key={req.id}
                    className="mb-4 p-6 border border-[#e5e5e5] rounded-lg"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-pretendard text-[16px] font-bold text-black">
                            {req.title}
                          </h3>
                          {getStatusBadge(req.status)}
                        </div>
                        <div className="font-pretendard text-[13px] text-[#7a7a7a] space-y-1">
                          <p>신청자: {req.user.email}</p>
                          <p>강사: {req.instructorName}</p>
                          <p>
                            날짜/시간: {req.date} {req.time}
                          </p>
                          <p>가격: ₩{req.price.toLocaleString()}</p>
                          <p>모집인원: {req.capacity}명</p>
                          <p>신청일: {new Date(req.createdAt).toLocaleDateString("ko-KR")}</p>
                        </div>
                      </div>

                      {req.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(req.id)}
                            disabled={actionLoading === req.id}
                          >
                            {actionLoading === req.id ? "처리중..." : "승인"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(req.id)}
                            disabled={actionLoading === req.id}
                          >
                            {actionLoading === req.id ? "처리중..." : "거절"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              {/* 트립&이벤트 신청 목록 */}
              {activeTab === "tripevent" &&
                filteredTripEventRequests.map((req) => (
                  <div
                    key={req.id}
                    className="mb-4 p-6 border border-[#e5e5e5] rounded-lg"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-pretendard text-[16px] font-bold text-black">
                            {req.className}
                          </h3>
                          {getStatusBadge(req.status)}
                        </div>
                        <div className="font-pretendard text-[13px] text-[#7a7a7a] space-y-1">
                          <p>신청자: {req.user.email}</p>
                          <p>강사: {req.instructorName}</p>
                          <p>유형: {req.classType}</p>
                          <p>
                            날짜/시간: {req.startDate} {req.timeInfo}
                          </p>
                          <p>모집인원: {req.capacity}명</p>
                          <p>장소: {req.locationInfo}</p>
                          <p>신청일: {new Date(req.createdAt).toLocaleDateString("ko-KR")}</p>
                        </div>
                      </div>

                      {req.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(req.id)}
                            disabled={actionLoading === req.id}
                          >
                            {actionLoading === req.id ? "처리중..." : "승인"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(req.id)}
                            disabled={actionLoading === req.id}
                          >
                            {actionLoading === req.id ? "처리중..." : "거절"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
