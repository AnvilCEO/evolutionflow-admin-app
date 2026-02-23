"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatusBadge from "../../components/StatusBadge";
import { getAdminMember, updateMember, Member } from "@/lib/api/admin";

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { accessToken } = useAuth();

  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Member>>({});

  // Fetch member data
  useEffect(() => {
    async function fetchMember() {
      if (!accessToken) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await getAdminMember(resolvedParams.id, accessToken);
        setMember(response.data);
        setFormData(response.data);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error.message || "회원 정보를 불러올 수 없습니다.");
        console.error("Failed to fetch member:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMember();
  }, [resolvedParams.id, accessToken]);

  const handleSave = async () => {
    if (!accessToken || !member) return;

    try {
      setIsSaving(true);
      setError(null);

      const response = await updateMember(resolvedParams.id, formData, accessToken);
      setMember(response.data);
      setIsEditing(false);

      // Show success message
      alert("회원 정보가 수정되었습니다.");
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message || "회원 정보 수정에 실패했습니다.");
      console.error("Failed to update member:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(member || {});
    setIsEditing(false);
  };

  if (isLoading) {
    return <LoadingSpinner message="회원 정보를 불러오는 중..." />;
  }

  if (!member) {
    return (
      <div className="rounded-md bg-red-50 p-8 text-center">
        <p className="text-red-800">회원 정보를 찾을 수 없습니다.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-4 text-sm text-gray-600 hover:text-black"
          >
            ← 뒤로가기
          </button>
          <h1 className="font-pretendard text-3xl font-bold text-black">{member.name}</h1>
          <p className="font-pretendard mt-2 text-gray-600">{member.email}</p>
        </div>
        <StatusBadge status={member.status} />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Basic Info Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-pretendard text-lg font-bold text-black">기본 정보</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              수정
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">이름</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            ) : (
              <p className="mt-2 text-gray-900">{member.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">이메일</label>
            <p className="mt-2 text-gray-900">{member.email}</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700">전화번호</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            ) : (
              <p className="mt-2 text-gray-900">{member.phone || "-"}</p>
            )}
          </div>

          {/* Birth Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">생년월일</label>
            {isEditing ? (
              <input
                type="date"
                value={formData.birthDate || ""}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            ) : (
              <p className="mt-2 text-gray-900">{member.birthDate || "-"}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700">성별</label>
            {isEditing ? (
              <select
                value={formData.gender || "NONE"}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as "MALE" | "FEMALE" | "NONE" })}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              >
                <option value="NONE">선택 안함</option>
                <option value="MALE">남성</option>
                <option value="FEMALE">여성</option>
              </select>
            ) : (
              <p className="mt-2 text-gray-900">
                {member.gender === "MALE" ? "남성" : member.gender === "FEMALE" ? "여성" : "선택 안함 (또는 미입력)"}
              </p>
            )}
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700">관심 분야</label>
            {isEditing ? (
              <input
                type="text"
                placeholder="예: 요가, 필라테스 (쉼표로 구분)"
                value={formData.interests?.join(", ") || ""}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            ) : (
              <p className="mt-2 text-gray-900">{member.interests?.join(", ") || "-"}</p>
            )}
          </div>

          {/* Marketing Consent */}
          <div>
            <label className="block text-sm font-medium text-gray-700">마케팅 수신 동의</label>
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                disabled={!isEditing}
                checked={isEditing ? !!formData.marketingConsent : !!member.marketingConsent}
                onChange={(e) => setFormData({ ...formData, marketingConsent: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="ml-2 text-sm text-gray-700">동의함</span>
            </div>
          </div>

          {/* Membership Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700">회원등급</label>
            <p className="mt-2 text-gray-900">
              {member.membershipLevel === "general"
                ? "일반"
                : member.membershipLevel === "instructor"
                ? "강사"
                : "프리미엄"}
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">상태</label>
            {isEditing ? (
              <select
                value={formData.status || member.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "active" | "inactive" | "suspended",
                  })
                }
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="suspended">정지됨</option>
              </select>
            ) : (
              <div className="mt-2">
                <StatusBadge status={member.status} />
              </div>
            )}
          </div>

          {/* Registration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">가입일</label>
            <p className="mt-2 text-gray-900">
              {new Date(member.registrationDate).toLocaleDateString("ko-KR")}
            </p>
          </div>

          {/* Last Login */}
          <div>
            <label className="block text-sm font-medium text-gray-700">마지막 로그인</label>
            <p className="mt-2 text-gray-900">
              {member.lastLogin
                ? new Date(member.lastLogin).toLocaleDateString("ko-KR")
                : "-"}
            </p>
          </div>

          {/* Profile Completeness */}
          <div>
            <label className="block text-sm font-medium text-gray-700">프로필 완성도</label>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-black transition-all"
                    style={{ width: `${member.profileCompleteness || 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {member.profileCompleteness || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-md bg-black px-6 py-2 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isSaving ? "저장 중..." : "저장"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="rounded-md border border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
          </div>
        )}
      </div>

      {/* Activity Summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-pretendard text-lg font-bold text-black">활동 요약</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm text-gray-600">가입 후 경과 시간</p>
            <p className="mt-2 text-xl font-bold text-black">
              {Math.floor(
                (Date.now() - new Date(member.registrationDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}
              일
            </p>
          </div>

          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm text-gray-600">회원등급</p>
            <p className="mt-2 text-lg font-bold text-black">
              {member.membershipLevel === "general"
                ? "일반"
                : member.membershipLevel === "instructor"
                ? "강사"
                : "프리미엄"}
            </p>
          </div>

          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm text-gray-600">프로필 완성도</p>
            <p className="mt-2 text-xl font-bold text-black">
              {member.profileCompleteness || 0}%
            </p>
          </div>

          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm text-gray-600">상태</p>
            <div className="mt-2">
              <StatusBadge status={member.status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
