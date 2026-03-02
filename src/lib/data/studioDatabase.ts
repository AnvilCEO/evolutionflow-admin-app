/**
 * Shared Mock Database for Studio Management
 * 모든 API 라우트가 공유하는 인메모리 데이터베이스
 */

import type { AdminStudioItem } from "@/types/studio";

function createInitialStudioDatabase(): Record<string, AdminStudioItem> {
  return {
    s1: {
      id: "s1",
      name: "강남 A스튜디오",
      tab: "official",
      country: "KR",
      city: "서울",
      region: "강남구",
      address: "서울시 강남구 테헤란로 123",
      phone: "02-1234-5678",
      social: "Instagram/gangnam",
      lat: 37.4979,
      lng: 127.0276,
      managerName: "최관리",
      managerPhone: "02-1234-5678",
      managerEmail: "manager@studio.com",
      capacity: 30,
      status: "active",
      description: "강남의 프리미엄 요가 스튜디오",
      operatingHours: "09:00 - 22:00",
      amenities: ["주차", "WiFi", "라커"],
      createdAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-02-15T00:00:00Z",
      createdBy: "admin",
      updatedBy: "admin",
    },
    s2: {
      id: "s2",
      name: "홍대 B스튜디오",
      tab: "partner",
      country: "KR",
      city: "서울",
      region: "마포구",
      address: "서울시 마포구 홍익로 45",
      phone: "02-9876-5432",
      social: "Instagram/hongdae",
      lat: 37.5502,
      lng: 126.9242,
      managerName: "박점장",
      managerPhone: "02-9876-5432",
      managerEmail: "park@studio.com",
      capacity: 20,
      status: "active",
      description: "홍대의 트렌디한 필라테스 스튜디오",
      operatingHours: "10:00 - 21:00",
      amenities: ["WiFi", "카페"],
      createdAt: "2025-02-20T00:00:00Z",
      updatedAt: "2025-02-20T00:00:00Z",
      createdBy: "admin",
      updatedBy: "admin",
    },
  };
}

const studioStore = globalThis as typeof globalThis & {
  __efStudioDatabase?: Record<string, AdminStudioItem>;
};

// Route handler 번들 간에 동일한 인메모리 저장소를 사용한다.
if (!studioStore.__efStudioDatabase) {
  studioStore.__efStudioDatabase = createInitialStudioDatabase();
}

export const studioDatabase = studioStore.__efStudioDatabase;
