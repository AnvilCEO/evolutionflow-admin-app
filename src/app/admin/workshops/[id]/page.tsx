"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/app/admin/components/LoadingSpinner";
import { getAdminWorkshop, WorkshopContent } from "@/lib/api/admin";

export default function WorkshopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { accessToken } = useAuth();

  const [workshop, setWorkshop] = useState<WorkshopContent | null>(null);
  const [formData, setFormData] = useState<Partial<WorkshopContent>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkshop() {
      if (!accessToken || !resolvedParams.id) return;

      try {
        setIsLoading(true);
        const response = await getAdminWorkshop(resolvedParams.id, accessToken);
        setWorkshop(response.data);
        setFormData(response.data);
        if (response.data.imageUrl) {
          setImagePreview(response.data.imageUrl);
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error.message || "워크샵 정보를 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkshop();
  }, [resolvedParams.id, accessToken]);

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
    if (!accessToken || !resolvedParams.id) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // API update logic here
      // const imgUrl = imageFile ? await uploadImage(imageFile) : formData.imageUrl;
      // await updateAdminWorkshop(resolvedParams.id, { ...formData, imageUrl: imgUrl }, accessToken);

      await new Promise(resolve => setTimeout(resolve, 800)); // Mock delay

      router.push("/admin/workshops");
      router.refresh();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message || "워크샵 정보를 저장할 수 없습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("이 워크샵을 삭제하시겠습니까? 신청자가 있는 경우 취소 처리를 권장합니다.")) return;
    if (!accessToken || !resolvedParams.id) return;

    try {
      setIsSubmitting(true);
      // await deleteAdminWorkshop(resolvedParams.id, accessToken);
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push("/admin/workshops");
      router.refresh();
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message || "삭제에 실패했습니다.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="워크샵 정보를 불러오는 중..." />;
  }

  if (!workshop) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-center text-sm text-red-800">
        워크샵을 찾을 수 없습니다.
        <button onClick={() => router.back()} className="block mx-auto mt-4 text-red-600 hover:underline">
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="font-pretendard text-2xl font-bold text-black">워크샵 상세 보기</h1>
            <p className="text-sm text-gray-500 mt-1">ID: {workshop.id}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
        >
          워크샵 영구 삭제
        </button>
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
                    <span className="text-xs">No img</span>
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
              </div>
            </div>
          </div>
        </section>

        {/* 설정 */}
        <section className="space-y-4 pt-4">
          <h2 className="text-lg font-semibold border-b pb-2">상태 설정</h2>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md border border-gray-200">
              <div>
                <h3 className="text-sm font-medium text-gray-900">플랫폼 노출 허용</h3>
                <p className="text-sm text-gray-500">리스트에 이 워크샵을 표시합니다.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive || false}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md border border-gray-200">
              <div>
                <h3 className="text-sm font-medium text-gray-900">운영 상태 (Status)</h3>
                <p className="text-sm text-gray-500">수동으로 워크샵의 상태를 강제 지정할 수 있습니다.</p>
              </div>
              <select
                name="status"
                value={formData.status || "OPEN"}
                onChange={handleChange}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              >
                <option value="OPEN">모집 중 (OPEN)</option>
                <option value="CLOSED">모집 마감 (CLOSED)</option>
                <option value="COMPLETED">진행 완료 (COMPLETED)</option>
                <option value="CANCELLED">선제 취소 (CANCELLED)</option>
              </select>
            </div>
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
            {isSubmitting ? "저장 중..." : "변경사항 저장"}
          </button>
        </div>
      </form>
    </div>
  );
}
