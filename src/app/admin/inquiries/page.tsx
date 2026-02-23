"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ContactContent, getAdminContacts, updateAdminContactStatus } from "@/lib/api/admin";
import LoadingSpinner from "@/app/admin/components/LoadingSpinner";

export default function InquiriesPage() {
  const { accessToken, isLoading: authLoading } = useAuth();

  const [contacts, setContacts] = useState<ContactContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  // Modal State
  const [selectedContact, setSelectedContact] = useState<ContactContent | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [accessToken, filterType, filterStatus]);

  async function fetchContacts() {
    if (authLoading) return;
    if (!accessToken) {
      setIsLoading(false);
      setError("로그인이 필요합니다.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await getAdminContacts(accessToken, {
        search,
        contactType: filterType || undefined,
        status: filterStatus || undefined,
      });
      setContacts(response.data);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
      setError("문의 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContacts();
  };

  const clearFilters = () => {
    setSearch("");
    setFilterType("");
    setFilterStatus("");
  };

  const handleStatusChange = async (contactId: string, newStatus: "received" | "reviewing" | "completed") => {
    if (!accessToken) return;

    try {
      setIsUpdating(true);
      await updateAdminContactStatus(contactId, newStatus, accessToken);

      // Update local state to reflect change instantly
      setContacts(prev => prev.map(c =>
        c.id === contactId ? { ...c, status: newStatus } : c
      ));

      // Also update selected contact if modal is open
      if (selectedContact?.id === contactId) {
        setSelectedContact({ ...selectedContact, status: newStatus });
      }

    } catch (err) {
      console.error("Failed to update status:", err);
      alert("상태 업데이트에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received": return "bg-red-50 text-red-700 ring-red-600/20";
      case "reviewing": return "bg-yellow-50 text-yellow-800 ring-yellow-600/20";
      case "completed": return "bg-green-50 text-green-700 ring-green-600/20";
      default: return "bg-gray-50 text-gray-700 ring-gray-600/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "received": return "수신 완료 (미확인)";
      case "reviewing": return "검토 중";
      case "completed": return "처리 완료";
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "partnership": return "제휴 문의";
      case "teacher": return "강사 지원";
      case "workshop": return "워크샵 기업 문의";
      default: return type;
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 border-l-4 border-black pl-3 ml-1">제휴 및 문의 관리</h1>
          <p className="mt-1 text-sm text-gray-500 ml-5">
            고객과 기업으로부터 인입된 각종 파트너십 및 수강 문의를 처리하는 인박스입니다.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="sr-only">검색어</label>
            <input
              type="text"
              id="search"
              placeholder="담당자명, 회사명 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="filterType" className="sr-only">문의 유형</label>
            <select
              id="filterType"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black font-medium text-gray-700"
            >
              <option value="">모든 문의 유형</option>
              <option value="partnership">제휴 문의</option>
              <option value="teacher">강사 지원</option>
              <option value="workshop">워크샵 기업 문의</option>
            </select>
          </div>

          <div>
            <label htmlFor="filterStatus" className="sr-only">상태</label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black font-medium text-gray-700"
            >
              <option value="">모든 진행 상태</option>
              <option value="received">수신 완료 (미확인)</option>
              <option value="reviewing">검토 중</option>
              <option value="completed">처리 완료</option>
            </select>
          </div>

          <div className="md:col-span-4 flex justify-end gap-2 border-t border-gray-100 pt-4 mt-2">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              필터 초기화
            </button>
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              검색 적용
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* List / Inbox View */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner message="문의 목록을 불러오는 중..." />
          </div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            조건에 맞는 문의 내역이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">접수일시</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">소속 / 담당자</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">내용 미리보기</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedContact(contact)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(contact.status)}`}>
                        {getStatusLabel(contact.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(contact.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric', month: '2-digit', day: '2-digit',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getTypeLabel(contact.contactType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{contact.company}</div>
                      <div className="text-sm text-gray-500">{contact.name} {contact.position && `(${contact.position})`}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 truncate max-w-xs xl:max-w-md">
                        {contact.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedContact(contact);
                        }}
                        className="text-black hover:text-gray-600 font-medium bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors"
                      >
                        상세 보기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal (Slide Over Simulator) */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
              onClick={() => setSelectedContact(null)}
            ></div>

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              {/* Slide-over panel */}
              <div className="pointer-events-auto w-screen max-w-lg transform transition-all duration-300 ease-in-out">
                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                  {/* Header */}
                  <div className="bg-black px-4 py-6 sm:px-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold leading-6 text-white" id="slide-over-title">
                        문의 상세 내역
                      </h2>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="relative rounded-md bg-black text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                          onClick={() => setSelectedContact(null)}
                        >
                          <span className="absolute -inset-2.5"></span>
                          <span className="sr-only">패널 닫기</span>
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-300 flex items-center justify-between">
                      <span>접수일: {new Date(selectedContact.createdAt).toLocaleString('ko-KR')}</span>
                      <span>ID: {selectedContact.id}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative flex-1 px-4 py-6 sm:px-6">

                    <div className="mb-6 pb-6 border-b border-gray-100">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">유형</span>
                          {getTypeLabel(selectedContact.contactType)}
                        </h3>
                        <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-semibold ring-1 ring-inset ${getStatusColor(selectedContact.status)}`}>
                          {getStatusLabel(selectedContact.status)}
                        </span>
                      </div>

                      <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">고객 정보</h4>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">회사/소속</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedContact.company} {selectedContact.department && `- ${selectedContact.department}`}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">담당자명</dt>
                            <dd className="mt-1 text-sm text-gray-900">{selectedContact.name} {selectedContact.position && `(${selectedContact.position})`}</dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-500">연락처</dt>
                            <dd className="mt-1 text-sm text-gray-900"><a href={`tel:${selectedContact.phone}`} className="text-blue-600 hover:underline">{selectedContact.phone}</a></dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">이메일</dt>
                            <dd className="mt-1 text-sm text-gray-900"><a href={`mailto:${selectedContact.email}`} className="text-blue-600 hover:underline">{selectedContact.email}</a></dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    <div className="mb-8">
                       <h4 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">상세 문의 내용</h4>
                       <div className="bg-white rounded-lg p-5 border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed shadow-sm min-h-[150px]">
                         {selectedContact.message}
                       </div>
                    </div>

                    {/* Action Area */}
                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3 block">진행 상태 변경</h4>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <select
                          value={selectedContact.status}
                          onChange={(e) => handleStatusChange(selectedContact.id, e.target.value as any)}
                          disabled={isUpdating}
                          className="block w-full sm:w-auto rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm font-medium"
                        >
                          <option value="received">수신 완료 (미확인)</option>
                          <option value="reviewing">검토 중</option>
                          <option value="completed">처리 완료</option>
                        </select>
                        <span className="text-xs text-gray-500">
                          {isUpdating ? "업데이트 중..." : "선택 시 즉시 저장됩니다."}
                        </span>
                      </div>

                      {selectedContact.status === "completed" && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-800 flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          이 문의는 처리가 완료되었습니다. 더 이상 조치가 필요하지 않습니다.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sticky Footer */}
                  <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-white flex justify-end">
                    <button
                      type="button"
                      className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      onClick={() => setSelectedContact(null)}
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
