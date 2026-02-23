"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ScheduleContent } from "@/lib/api/admin";

export default function NewSchedulePage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ScheduleContent>>({
    classType: "REGULAR",
    status: "OPEN",
    isActive: true,
    days: [],
    capacity: 15,
    price: 0,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDayToggle = (day: "월" | "화" | "수" | "목" | "금" | "토" | "일") => {
    setFormData(prev => {
      const days = prev.days || [];
      if (days.includes(day)) {
         return { ...prev, days: days.filter(d => d !== day) };
      } else {
         return { ...prev, days: [...days, day] };
      }
    });
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // In a real app, you would upload this file to storage and get a URL back
      setFormData((prev) => ({ ...prev, imageUrl: "dummy-url.png" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    if (!formData.className || !formData.instructorName) {
      setError("스케줄 이름과 담당 강사명은 필수입니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Mock API call to save schedule
      await new Promise(resolve => setTimeout(resolve, 800));

      console.log("Saving schedule:", formData);

      router.push("/admin/schedules");
      router.refresh();
    } catch (err: unknown) {
      console.error("Failed to create schedule:", err);
      setError("스케줄을 등록하는 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar space-y-6 pb-20">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-black mb-4 flex items-center gap-2 transition-colors"
        >
          ← 뒤로 가기
        </button>
        <h1 className="font-pretendard text-3xl font-bold text-black">신규 스케줄 등록</h1>
        <p className="mt-2 text-sm text-gray-600">
          달력과 리스트에 노출될 새로운 스케줄을 개설합니다.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 border border-red-200 shadow-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Basic Info */}
        <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">기본 정보</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-1">
                스케줄 (수업) 명 *
              </label>
              <input
                type="text"
                id="className"
                name="className"
                required
                value={formData.className || ""}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-colors"
                placeholder="예: 초보자를 위한 빈야사 기초"
              />
            </div>

            <div>
              <label htmlFor="instructorName" className="block text-sm font-medium text-gray-700 mb-1">
                담당 강사명 *
              </label>
              <input
                type="text"
                id="instructorName"
                name="instructorName"
                required
                value={formData.instructorName || ""}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-colors"
                placeholder="배정된 강사명을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="classType" className="block text-sm font-medium text-gray-700 mb-1">
                수업 유형 *
              </label>
              <select
                id="classType"
                name="classType"
                required
                value={formData.classType || "REGULAR"}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-colors bg-white"
              >
                <option value="REGULAR">정규 (Regular)</option>
                <option value="SPECIAL">특강/워크샵 (Special)</option>
                <option value="TTC">지도자과정 (TTC)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="classDesc" className="block text-sm font-medium text-gray-700 mb-1">
                상세 소개 *
              </label>
              <textarea
                id="classDesc"
                name="classDesc"
                required
                rows={4}
                value={formData.classDesc || ""}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-colors"
                placeholder="수업의 상세 소개, 커리큘럼, 기대효과 등을 자유롭게 기술하세요."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대표 썸네일 이미지
              </label>
              <div className="flex items-center gap-6">
                <div className="h-32 w-32 overflow-hidden rounded-lg border border-gray-300 bg-gray-50 flex-shrink-0 relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400 bg-gray-100 flex-col gap-2">
                       <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                       </svg>
                       <span className="text-xs">No img</span>
                    </div>
                  )}
                  {imagePreview && (
                    <button type="button" onClick={() => setImagePreview(null)} className="absolute top-1 right-1 bg-white/80 rounded-full p-1 border shadow-sm hover:bg-white text-gray-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-black file:text-white
                      hover:file:bg-gray-800
                      file:cursor-pointer file:transition-colors"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    권장 비율 1:1, 최소 600x600px 이상. JPG, PNG 형식 지원.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule & Location */}
        <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">일정 및 장소 정보</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                시작일 *
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                required
                value={formData.startDate || ""}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                종료일 *
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                required
                value={formData.endDate || ""}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                운영 요일 선택 *
              </label>
              <div className="flex gap-2 bg-gray-50 p-3 rounded-md border border-gray-200">
                {(["월", "화", "수", "목", "금", "토", "일"] as const).map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors border ${
                      formData.days?.includes(day)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="timeInfo" className="block text-sm font-medium text-gray-700 mb-1">
                시간 및 상세정보 *
              </label>
              <input
                type="text"
                id="timeInfo"
                name="timeInfo"
                required
                value={formData.timeInfo || ""}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-colors"
                placeholder="예: 14:00 - 18:00 (오후반)"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="locationInfo" className="block text-sm font-medium text-gray-700 mb-1">
                오프라인 진행 장소 *
              </label>
              <input
                type="text"
                id="locationInfo"
                name="locationInfo"
                required
                value={formData.locationInfo || ""}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-colors"
                placeholder="예: 에볼루션플로우 코리아 강남 스튜디오 A홀"
              />
            </div>
          </div>
        </div>

        {/* Capacity & Price */}
        <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">모집 및 상태 관리</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                정원 (명) *
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                min="1"
                required
                value={formData.capacity || ""}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-colors"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                수강료 (원) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="1000"
                required
                value={formData.price ?? ""}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-right focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-colors"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                모집 상태 *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || "OPEN"}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-colors bg-white font-medium"
              >
                <option value="OPEN" className="text-green-700">예약 오픈 (OPEN)</option>
                <option value="FULL" className="text-gray-500">마감 (FULL)</option>
                <option value="WAITLIST" className="text-purple-600">대기 접수중 (WAITLIST)</option>
                <option value="CANCELLED" className="text-red-500">취소됨 (CANCELLED)</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-900">플랫폼 노출 상태</h3>
              <p className="text-xs text-gray-500 mt-1">이 스케줄을 사용자 화면에 노출할지 결정합니다.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.isActive !== false}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {formData.isActive !== false ? '노출 (활성)' : '숨김 (비활성)'}
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 flex justify-end gap-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-black px-8 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSubmitting ? "처리 중..." : "스케줄 등록하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
