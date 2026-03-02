"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import StudioForm from "../components/StudioForm";
import { createStudio } from "@/lib/api/admin/studios";
import type { StudioFormData } from "@/types/studio";

export default function CreateStudioPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: StudioFormData) => {
    if (!accessToken) return;

    try {
      setIsLoading(true);

      // Call API to create studio
      const response = await createStudio(data, accessToken);

      if (response.success) {
        alert("스튜디오가 등록되었습니다.");
        router.push("/admin/studios?tab=official");
      } else {
        alert("등록에 실패했습니다.");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "등록에 실패했습니다.";
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-pretendard text-3xl font-bold text-black">신규 스튜디오 등록</h1>
        <p className="font-pretendard mt-2 text-gray-600">새로운 스튜디오 정보를 입력하세요.</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200">
        <StudioForm isLoading={isLoading} onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
