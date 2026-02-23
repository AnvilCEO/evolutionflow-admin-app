"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { WorkshopContent } from "@/lib/api/admin";

export default function NewWorkshopPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<WorkshopContent>>({
    title: "",
    instructorName: "",
    level: "ALL",
    startDate: "",
    endDate: "",
    timeInfo: "",
    locationInfo: "",
    capacity: 10,
    price: 0,
    category: "VINYASA",
    description: "",
    notes: [""],
    refundPolicy: "개강 7일 전: 100% 환불\n개강 3일 전: 50% 환불\n개강 당일 및 이후: 환불 불가",
    isActive: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Dynamic Notes List
  const handleNoteChange = (index: number, value: string) => {
    const newNotes = [...(formData.notes || [])];
    newNotes[index] = value;
    setFormData(prev => ({ ...prev, notes: newNotes }));
  };

  const addNoteInput = () => {
    setFormData(prev => ({ ...prev, notes: [...(prev.notes || []), ""] }));
  };

  const removeNoteInput = (index: number) => {
    const newNotes = [...(formData.notes || [])];
    if (newNotes.length > 1) {
      newNotes.splice(index, 1);
      setFormData(prev => ({ ...prev, notes: newNotes }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // In a real app, we'd upload the image first if it exists
      // const imgUrl = imageFile ? await uploadImage(imageFile) : "";

      // API call to create workshop
      // await createAdminWorkshop({ ...formData, imageUrl: imgUrl }, accessToken);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      router.push("/admin/workshops");
      router.refresh();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message || "워크샵 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="font-pretendard text-2xl font-bold text-black">신규 워크샵 등록</h1>
          <p className="text-sm text-gray-500 mt-1">새로운 워크샵 프로그램을 개설합니다.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100 pb-20">

        {/* 기본 정보 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">기본 정보</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">워크샵 타이틀 *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title || ""}
                onChange={handleChange}
                placeholder="예: 초보자를 위한 빈야사 기초"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">지도 강사명 *</label>
              <input
                type="text"
                name="instructorName"
                required
                value={formData.instructorName || ""}
                onChange={handleChange}
                placeholder="담당 강사명을 입력하세요"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">카테고리 *</label>
              <select
                name="category"
                value={formData.category || "VINYASA"}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              >
                <option value="VINYASA">빈야사 (Vinyasa)</option>
                <option value="HATHA">하타 (Hatha)</option>
                <option value="ASHTANGA">아쉬탕가 (Ashtanga)</option>
                <option value="THERAPY">테라피 (Therapy)</option>
                <option value="SPECIAL">스페셜 (Special)</option>
                <option value="OTHER">기타 (Other)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">상세 커리큘럼 작성 *</label>
            <textarea
              name="description"
              required
              rows={5}
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="워크샵의 상세 소개, 커리큘럼, 기대효과 등을 자유롭게 기술하세요."
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none resize-y"
            />
          </div>
        </section>

        {/* 일정 및 장소 */}
        <section className="space-y-4 pt-4">
          <h2 className="text-lg font-semibold border-b pb-2">일정 및 장소 정보</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">시작일 *</label>
              <input
                type="date"
                name="startDate"
                required
                value={formData.startDate || ""}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">종료일 *</label>
              <input
                type="date"
                name="endDate"
                required
                value={formData.endDate || ""}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">시간 및 요일 상세정보 *</label>
              <input
                type="text"
                name="timeInfo"
                required
                value={formData.timeInfo || ""}
                onChange={handleChange}
                placeholder="예: 매주 토, 일 14:00 - 18:00 (총 4주)"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">오프라인 진행 장소 *</label>
              <input
                type="text"
                name="locationInfo"
                required
                value={formData.locationInfo || ""}
                onChange={handleChange}
                placeholder="예: 에볼루션플로우 코리아 강남 스튜디오 A홀"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* 모집 및 세일즈 정보 */}
        <section className="space-y-4 pt-4">
          <h2 className="text-lg font-semibold border-b pb-2">모집 & 세일즈 정책</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">수강 대상 난이도 *</label>
              <select
                name="level"
                value={formData.level || "ALL"}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              >
                <option value="ALL">전체 (All Levels)</option>
                <option value="BEGINNER">입문/초급 (Beginner)</option>
                <option value="INTERMEDIATE">중급 (Intermediate)</option>
                <option value="ADVANCED">고급/심화 (Advanced)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">정원 (Capacity) *</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  required
                  value={formData.capacity || 0}
                  onChange={handleChange}
                  className="block w-full rounded-none rounded-l-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                />
                <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                  명
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">참가비 (수강료) *</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="1000"
                  required
                  value={formData.price || 0}
                  onChange={handleChange}
                  className="block w-full rounded-none rounded-l-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                />
                <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                  원
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 부가 정보 및 정책 */}
        <section className="space-y-4 pt-4">
          <h2 className="text-lg font-semibold border-b pb-2">안내 및 정책</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">공지사항 및 준비물 (Notes)</label>
            <div className="space-y-2">
              {formData.notes?.map((note, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-400 w-4 text-right">{idx + 1}.</span>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => handleNoteChange(idx, e.target.value)}
                    placeholder="예: 편안한 요가복과 개인 물통을 준비해주세요."
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeNoteInput(idx)}
                    disabled={formData.notes?.length === 1}
                    className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30"
                  >
                    삭제
                  </button>
                </div>
              ))}
              <div className="pl-7 mt-2">
                <button
                  type="button"
                  onClick={addNoteInput}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>+</span> 항목 추가
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700">환불 규정 정책</label>
            <textarea
              name="refundPolicy"
              rows={3}
              value={formData.refundPolicy || ""}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            />
          </div>
        </section>

        {/* 미디어 업로드 */}
        <section className="space-y-4 pt-4">
          <h2 className="text-lg font-semibold border-b pb-2">대표 이미지</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">썸네일 사진 첨부</label>
            <div className="mt-2 flex items-center gap-6">
              <div className="h-32 w-48 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400 bg-gray-100">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="mt-2 text-xs text-gray-500">
                  권장 해상도: 800x600px 이상, 최대 5MB (JPG, PNG)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 설정 */}
        <section className="space-y-4 pt-4">
          <h2 className="text-lg font-semibold border-b pb-2">상태 설정</h2>

          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md border border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-900">플랫폼 노출 허용</h3>
              <p className="text-sm text-gray-500">이 워크샵을 고객들에게 공개하고 모집을 시작합니다.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </section>

        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 shadow-[-0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 flex justify-end gap-3 px-8">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none disabled:opacity-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none disabled:opacity-50 transition-colors flex items-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                등록 중...
              </>
            ) : "워크샵 개설하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
