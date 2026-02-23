"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/app/admin/components/LoadingSpinner";
import { getAdminInstructor, updateAdminInstructor, TeacherContent } from "@/lib/api/admin";

export default function InstructorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { accessToken } = useAuth();

  const [instructor, setInstructor] = useState<TeacherContent | null>(null);
  const [formData, setFormData] = useState<Partial<TeacherContent>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInstructor() {
      if (!accessToken || !resolvedParams.id) return;

      try {
        setIsLoading(true);
        const response = await getAdminInstructor(resolvedParams.id, accessToken);
        setInstructor(response.data);
        setFormData(response.data); // Initialize form
      } catch (err: unknown) {
        console.error("Failed to fetch instructor details:", err);
        setError("강사 정보를 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInstructor();
  }, [resolvedParams.id, accessToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // @ts-ignore
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleCareerChange = (index: number, value: string) => {
    const newCareer = [...(formData.career || [])];
    newCareer[index] = value;
    setFormData({ ...formData, career: newCareer });
  };

  const addCareerInput = () => {
    setFormData({ ...formData, career: [...(formData.career || []), ""] });
  };

  const removeCareerInput = (index: number) => {
    const newCareer = [...(formData.career || [])];
    newCareer.splice(index, 1);
    setFormData({ ...formData, career: newCareer });
  };

  const handleStatusUpdate = async (newStatus: boolean) => {
    if (!accessToken || !instructor) return;
    try {
      setIsSubmitting(true);
      setError(null);
      const updatedData = { ...formData, isActive: newStatus };
      await updateAdminInstructor(instructor.code, { isActive: newStatus }, accessToken);
      setFormData(updatedData);
      setInstructor(updatedData as TeacherContent);
      alert(`상태가 ${newStatus ? '활성' : '비활성'}로 변경되었습니다.`);
    } catch (err: unknown) {
      console.error("Failed to update status:", err);
      setError("상태 업데이트에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !instructor) return;

    try {
      setIsSubmitting(true);
      // Clean up empty career lines
      const cleanedData = {
        ...formData,
        career: formData.career?.filter(c => c.trim() !== "") || []
      };

      await updateAdminInstructor(instructor.code, cleanedData, accessToken);
      setInstructor(cleanedData as TeacherContent);
      alert("강사 정보가 성공적으로 수정되었습니다.");
      router.push("/admin/instructors");
    } catch (err: unknown) {
      setError("정보 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="강사 정보를 불러오는 중..." />;
  }

  if (error || !instructor) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-800">
        <p className="font-bold">{error || "강사 정보를 찾을 수 없습니다."}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 rounded-md bg-white px-4 py-2 text-sm font-medium border border-red-300 hover:bg-red-100"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-4 text-sm text-gray-500 hover:text-black"
          >
            ← 목록으로 돌아가기
          </button>
          <div className="flex items-center gap-4">
            <h1 className="font-pretendard text-3xl font-bold text-black">
              {instructor.name} 강사 상세
            </h1>
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
              formData.isActive ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/10'
            }`}>
              {formData.isActive ? "온라인 활성" : "오프라인 (비활성화됨)"}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">강사 코드: {instructor.code}</p>
        </div>

        <div className="flex gap-2">
          {!formData.isActive ? (
            <button
              onClick={() => handleStatusUpdate(true)}
              disabled={isSubmitting}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              퍼블릭 노출 시작하기
            </button>
          ) : (
            <button
              onClick={() => handleStatusUpdate(false)}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              플랫폼에 숨기기 (비활성화)
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="grid gap-6 md:grid-cols-2">

            {/* 기본 신상 정보 Section */}
            <div className="md:col-span-2 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900">기본 정보 수정</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">이름 <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                required
                value={formData.name || ""}
                onChange={handleChange}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">한 줄 소개 (Tagline) <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="tagline"
                required
                value={formData.tagline || ""}
                onChange={handleChange}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>

            {/* 분류 정보 Section */}
            <div className="md:col-span-2 border-b border-gray-100 pb-4 pt-4">
              <h3 className="text-lg font-bold text-gray-900">소속 및 등급</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">소속 국가</label>
              <select
                name="country"
                value={formData.country || "KR"}
                onChange={handleChange}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              >
                <option value="KR">대한민국</option>
                <option value="CN">중국</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">강사 등급 (Grade)</label>
              <select
                name="grade"
                value={formData.grade || "I"}
                onChange={handleChange}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              >
                <option value="I">I (리더 강사)</option>
                <option value="WE">WE (시니어 강사)</option>
                <option value="EARTH">EARTH (주니어 강사)</option>
                <option value="UNIVERSE">UNIVERSE (스페셜 초청)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">활동 레벨 (Level)</label>
              <select
                name="level"
                value={formData.level || "LEVEL_1"}
                onChange={handleChange}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              >
                <option value="LEVEL_1">레벨 1</option>
                <option value="LEVEL_2">레벨 2</option>
                <option value="LEVEL_3">레벨 3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">강사 노출 순서 우선순위</label>
              <input
                type="number"
                name="sortOrder"
                value={formData.sortOrder || 0}
                onChange={handleChange}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>

            {/* 이력사항 Section */}
            <div className="md:col-span-2 border-b border-gray-100 pb-4 pt-4">
              <h3 className="text-lg font-bold text-gray-900">경력 및 이력사항 편집</h3>
            </div>

            <div className="md:col-span-2 space-y-3">
              {formData.career?.map((c, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-400 w-4 text-right">{idx + 1}.</span>
                  <input
                    type="text"
                    value={c}
                    onChange={(e) => handleCareerChange(idx, e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeCareerInput(idx)}
                    disabled={formData.career?.length === 1}
                    className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-30"
                  >
                    삭제
                  </button>
                </div>
              ))}
              <div className="pl-7 mt-2">
                <button
                  type="button"
                  onClick={addCareerInput}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>+</span> 항목 추가
                </button>
              </div>
            </div>

            {/* SNS 및 미디어 테마 Section */}
            <div className="md:col-span-2 border-b border-gray-100 pb-4 pt-4">
              <h3 className="text-lg font-bold text-gray-900">세부 꾸미기 및 SNS</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">대표 SNS 링크 유형</label>
              <select
                name="sns"
                value={formData.sns || "instagram"}
                onChange={handleChange}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              >
                <option value="instagram">Instagram</option>
                <option value="wechat">WeChat</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div className="md:col-span-2 flex flex-col gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="pcSnsAndCareerColorIsWhite"
                  checked={formData.pcSnsAndCareerColorIsWhite || false}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <div>
                  <span className="text-sm font-bold text-gray-900 block">강사 상세페이지 테마 (텍스트 화이트 지정)</span>
                  <span className="text-xs text-gray-500 block mt-1">배경이 어두울 경우 체크하면 폰트가 흰색으로 렌더링 됩니다.</span>
                </div>
              </label>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700">목록 썸네일 (URL)</label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl || ""}
                onChange={handleChange}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
              {formData.imageUrl && (
                <img src={formData.imageUrl} alt="preview" className="mt-2 h-16 w-16 object-cover rounded-md shadow-sm border border-gray-200" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">테마 와이드 배경 (URL)</label>
              <input
                type="text"
                name="detailImageUrl"
                value={formData.detailImageUrl || ""}
                onChange={handleChange}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
              {formData.detailImageUrl && (
                <img src={formData.detailImageUrl} alt="preview" className="mt-2 h-16 w-32 object-cover rounded-md shadow-sm border border-gray-200" />
              )}
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? "데이터 저장 중..." : "수정 내용 저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
