"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import StudioForm from "../components/StudioForm";
import { getStudio, updateStudio, deleteStudio } from "@/lib/api/admin/studios";
import type { AdminStudioItem, StudioFormData } from "@/types/studio";

export default function StudioDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string | string[] }>();
  const studioId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [studio, setStudio] = useState<AdminStudioItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load studio data from API
  React.useEffect(() => {
    async function loadStudio() {
      if (!accessToken || !studioId) return;

      try {
        setError(null);
        const response = await getStudio(studioId, accessToken);
        if (response.success) {
          setStudio(response.data);
        } else {
          setError("스튜디오를 찾을 수 없습니다.");
        }
      } catch (err: unknown) {
        console.error("Failed to load studio:", err);
        setError("스튜디오를 불러올 수 없습니다.");
      }
    }

    loadStudio();
  }, [studioId, accessToken]);

  const handleSubmit = async (data: StudioFormData) => {
    if (!accessToken || !studioId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Call API to update studio
      const response = await updateStudio(studioId, data, accessToken);

      if (response.success) {
        alert("스튜디오 정보가 저장되었습니다.");
        router.push("/admin/studios?tab=official");
      } else {
        setError("저장에 실패했습니다.");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "저장에 실패했습니다.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!accessToken || !studioId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Call API to delete studio
      const response = await deleteStudio(studioId, accessToken);

      if (response.success) {
        alert("스튜디오가 삭제되었습니다.");
        router.push("/admin/studios?tab=official");
      } else {
        setError("삭제에 실패했습니다.");
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "삭제에 실패했습니다.";
      setError(errorMsg);
      setShowDeleteConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (error && !studio) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{error}</div>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          돌아가기
        </button>
      </div>
    );
  }

  if (!studio) {
    return <LoadingSpinner message="스튜디오 정보를 불러오는 중..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="font-pretendard text-3xl font-bold text-black">{studio.name}</h1>
          <p className="font-pretendard mt-2 text-gray-600">스튜디오 정보를 수정할 수 있습니다.</p>
        </div>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
        >
          삭제
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200">
        <StudioForm
          studio={studio}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-black mb-2">스튜디오 삭제</h3>
            <p className="text-gray-600 mb-6">
              &quot;{studio.name}&quot;을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
