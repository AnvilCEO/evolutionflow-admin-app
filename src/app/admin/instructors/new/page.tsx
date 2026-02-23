"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createAdminInstructor, TeacherContent } from "@/lib/api/admin";

export default function NewInstructorPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<TeacherContent>>({
    name: "",
    tagline: "",
    level: "LEVEL_1",
    grade: "I",
    country: "KR",
    sns: "instagram",
    career: [""], // Initialize with one empty input
    pcSnsAndCareerColorIsWhite: false,
    isActive: true,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Clean up empty career lines
      const cleanedData = {
        ...formData,
        career: formData.career?.filter(c => c.trim() !== "") || []
      };

      await createAdminInstructor(cleanedData, accessToken);

      alert("신규 강사가 성공적으로 등록되었습니다.");
      router.push("/admin/instructors");

    } catch (err: unknown) {
      console.error("Failed to register instructor:", err);
      setError(err instanceof Error ? err.message : "강사 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-4 text-sm text-gray-600 hover:text-black"
          >
            ← 뒤로가기
          </button>
          <h1 className="font-pretendard text-3xl font-bold text-black">신규 강사 등록</h1>
          <p className="font-pretendard mt-2 text-gray-600">
            앱에 노출될 새로운 강사를 등록합니다.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Form Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="grid gap-6 md:grid-cols-2">

            {/* 기본 신상 정보 Section */}
            <div className="md:col-span-2 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900">기본 정보</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">이름 <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="예: 홍길동"
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">한 줄 소개 (Tagline) <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="tagline"
                required
                value={formData.tagline}
                onChange={handleChange}
                placeholder="예: 삶에 균형을 더하는 도구, 요가"
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
                value={formData.country}
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
                value={formData.grade}
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
                value={formData.level}
                onChange={handleChange}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              >
                <option value="LEVEL_1">레벨 1</option>
                <option value="LEVEL_2">레벨 2</option>
                <option value="LEVEL_3">레벨 3</option>
              </select>
            </div>

            {/* 이력사항 Section */}
            <div className="md:col-span-2 border-b border-gray-100 pb-4 pt-4">
              <h3 className="text-lg font-bold text-gray-900">강사 경력 및 이력사항</h3>
              <p className="text-xs text-gray-500 mt-1">상세 페이지에 노출될 주요 경력을 한 줄씩 입력하세요.</p>
            </div>

            <div className="md:col-span-2 space-y-3">
              {formData.career?.map((c, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-400 w-4 text-right">{idx + 1}.</span>
                  <input
                    type="text"
                    value={c}
                    onChange={(e) => handleCareerChange(idx, e.target.value)}
                    placeholder="예: 에볼루션플로우 코리아 전임 강사"
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
                  <span>+</span> 이력 항목 추가
                </button>
              </div>
            </div>

            {/* SNS 및 미디어 테마 Section */}
            <div className="md:col-span-2 border-b border-gray-100 pb-4 pt-4">
              <h3 className="text-lg font-bold text-gray-900">프로필 노출 설정</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">대표 SNS 링크 유형</label>
              <select
                name="sns"
                value={formData.sns}
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
                  checked={formData.pcSnsAndCareerColorIsWhite}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <div>
                  <span className="text-sm font-bold text-gray-900 block">강사 상세페이지 테마 (텍스트 화이트)</span>
                  <span className="text-xs text-gray-500 block mt-1">배경 이미지가 어두울 경우, 상세 내용 글씨체를 흰색으로 반전시켜 렌더링합니다.</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 mt-2 pt-4 border-t border-gray-200">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <div>
                  <span className="text-sm font-bold text-gray-900 block">계정 즉시 활성화</span>
                  <span className="text-xs text-gray-500 block mt-1">체크 해제 시 시스템에는 저장되나 사용자 사이트에는 등록되지 않습니다.</span>
                </div>
              </label>
            </div>

          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? "데이터 저장 중..." : "신규 강사 등록하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
