/** @jest-environment node */
/**
 * API Route Tests - Studios
 *
 * Tests all studio API endpoints:
 * - GET /api/admin/studios (list with filters, sorting, pagination)
 * - POST /api/admin/studios (create)
 * - GET /api/admin/studios/:id (get by ID)
 * - PUT /api/admin/studios/:id (update)
 * - DELETE /api/admin/studios/:id (delete)
 * - PATCH /api/admin/studios/:id/status (status update)
 */

import { GET, POST } from "@/app/api/admin/studios/route";
import { NextRequest } from "next/server";
import { studioDatabase } from "@/lib/data/studioDatabase";
import { mockStudioFormData, createMockStudio, generateMockStudios } from "@/__tests__/fixtures/studios.fixture";
import type { AdminStudioItem } from "@/types/studio";

// Helper to create NextRequest
function createRequest(url: string, options: RequestInit = {}): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), options);
}

describe("GET /api/admin/studios - List Studios", () => {
  beforeEach(() => {
    // Reset database
    Object.keys(studioDatabase).forEach(key => delete studioDatabase[key]);

    // Add test data
    const studios = generateMockStudios(30);
    studios.forEach(studio => {
      studioDatabase[studio.id] = studio;
    });
  });

  it("should return all studios with default pagination", async () => {
    const request = createRequest("http://localhost:3000/api/admin/studios");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(10); // default pageSize
    expect(data.pagination).toEqual({
      page: 1,
      pageSize: 10,
      total: 30,
      totalPages: 3,
    });
  });

  it("should filter by tab", async () => {
    const request = createRequest("http://localhost:3000/api/admin/studios?tab=official");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    data.data.forEach((studio: AdminStudioItem) => {
      expect(studio.tab).toBe("official");
    });
  });

  it("should filter by status", async () => {
    const request = createRequest("http://localhost:3000/api/admin/studios?status=active");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    data.data.forEach((studio: AdminStudioItem) => {
      expect(studio.status).toBe("active");
    });
  });

  it("should filter by country", async () => {
    const request = createRequest("http://localhost:3000/api/admin/studios?country=KR");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    data.data.forEach((studio: AdminStudioItem) => {
      expect(studio.country).toBe("KR");
    });
  });

  it("should filter by city", async () => {
    const request = createRequest("http://localhost:3000/api/admin/studios?city=seoul");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    data.data.forEach((studio: AdminStudioItem) => {
      expect(studio.city).toBe("seoul");
    });
  });

  it("should search by name", async () => {
    const studio = createMockStudio({ name: "Unique Studio Name" });
    studioDatabase[studio.id] = studio;

    const request = createRequest("http://localhost:3000/api/admin/studios?search=unique");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.some((s: AdminStudioItem) => s.id === studio.id)).toBe(true);
  });

  it("should search by address", async () => {
    const studio = createMockStudio({ address: "123 Unique Address St" });
    studioDatabase[studio.id] = studio;

    const request = createRequest("http://localhost:3000/api/admin/studios?search=unique%20address");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.some((s: AdminStudioItem) => s.id === studio.id)).toBe(true);
  });

  it("should combine multiple filters", async () => {
    const request = createRequest(
      "http://localhost:3000/api/admin/studios?tab=official&status=active&country=KR"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    data.data.forEach((studio: AdminStudioItem) => {
      expect(studio.tab).toBe("official");
      expect(studio.status).toBe("active");
      expect(studio.country).toBe("KR");
    });
  });

  it("should sort by name ascending", async () => {
    const request = createRequest(
      "http://localhost:3000/api/admin/studios?sortKey=name&sortDirection=asc"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    const names = data.data.map((s: AdminStudioItem) => s.name);
    const sortedNames = [...names].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    expect(names).toEqual(sortedNames);
  });

  it("should sort by name descending", async () => {
    const request = createRequest(
      "http://localhost:3000/api/admin/studios?sortKey=name&sortDirection=desc"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    const names = data.data.map((s: AdminStudioItem) => s.name);
    const sortedNames = [...names].sort((a, b) => b.toLowerCase().localeCompare(a.toLowerCase()));
    expect(names).toEqual(sortedNames);
  });

  it("should sort by updatedAt descending (default)", async () => {
    const request = createRequest(
      "http://localhost:3000/api/admin/studios?sortKey=updatedAt&sortDirection=desc"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    const dates = data.data.map((s: AdminStudioItem) => new Date(s.updatedAt).getTime());

    for (let i = 1; i < dates.length; i++) {
      expect(dates[i - 1]).toBeGreaterThanOrEqual(dates[i]);
    }
  });

  it("should handle pagination - page 2", async () => {
    const request = createRequest("http://localhost:3000/api/admin/studios?page=2&pageSize=10");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.page).toBe(2);
    expect(data.data).toHaveLength(10);
  });

  it("should handle pagination - last page", async () => {
    const request = createRequest("http://localhost:3000/api/admin/studios?page=3&pageSize=10");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.pagination.page).toBe(3);
    expect(data.data).toHaveLength(10);
  });

  it("should handle custom page size", async () => {
    const request = createRequest("http://localhost:3000/api/admin/studios?pageSize=5");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(5);
    expect(data.pagination.pageSize).toBe(5);
    expect(data.pagination.totalPages).toBe(6);
  });

  it("should return empty array when no results match filter", async () => {
    const request = createRequest("http://localhost:3000/api/admin/studios?search=nonexistent");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(0);
    expect(data.pagination.total).toBe(0);
  });

  it("should handle server errors gracefully", async () => {
    // Mock to throw error
    const originalValues = Object.values;
    Object.values = jest.fn().mockImplementation(() => {
      throw new Error("Database error");
    });

    const request = createRequest("http://localhost:3000/api/admin/studios");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("스튜디오 목록 조회에 실패했습니다.");

    // Restore
    Object.values = originalValues;
  });
});

describe("POST /api/admin/studios - Create Studio", () => {
  beforeEach(() => {
    // Reset database
    Object.keys(studioDatabase).forEach(key => delete studioDatabase[key]);
  });

  it("should create a new studio with valid data", async () => {
    const request = createRequest("http://localhost:3000/api/admin/studios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockStudioFormData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe("스튜디오가 등록되었습니다.");
    expect(data.data).toMatchObject({
      name: mockStudioFormData.name,
      tab: mockStudioFormData.tab,
      country: mockStudioFormData.country,
      city: mockStudioFormData.city,
      region: mockStudioFormData.region,
    });
    expect(data.data.id).toBeDefined();
    expect(data.data.createdAt).toBeDefined();
    expect(data.data.updatedAt).toBeDefined();
  });

  it("should generate unique ID for new studio", async () => {
    const request1 = createRequest("http://localhost:3000/api/admin/studios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockStudioFormData),
    });

    const request2 = createRequest("http://localhost:3000/api/admin/studios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockStudioFormData),
    });

    const response1 = await POST(request1);
    const data1 = await response1.json();

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    const response2 = await POST(request2);
    const data2 = await response2.json();

    expect(data1.data.id).not.toBe(data2.data.id);
  });

  it("should return 400 when required fields are missing", async () => {
    const invalidData = {
      name: "",
      tab: "official",
    };

    const request = createRequest("http://localhost:3000/api/admin/studios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe("필수 필드를 모두 입력해주세요.");
  });

  it("should return 400 when name is missing", async () => {
    const invalidData = { ...mockStudioFormData, name: "" };

    const request = createRequest("http://localhost:3000/api/admin/studios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("should return 400 when tab is missing", async () => {
    const invalidData = { ...mockStudioFormData, tab: undefined };

    const request = createRequest("http://localhost:3000/api/admin/studios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("should return 400 when country is missing", async () => {
    const invalidData = { ...mockStudioFormData, country: undefined };

    const request = createRequest("http://localhost:3000/api/admin/studios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("should return 400 when city is missing", async () => {
    const invalidData = { ...mockStudioFormData, city: "" };

    const request = createRequest("http://localhost:3000/api/admin/studios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("should return 400 when region is missing", async () => {
    const invalidData = { ...mockStudioFormData, region: "" };

    const request = createRequest("http://localhost:3000/api/admin/studios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("should accept optional fields", async () => {
    const dataWithOptionals = {
      ...mockStudioFormData,
      managerName: "Manager Name",
      managerPhone: "010-1234-5678",
      managerEmail: "manager@example.com",
      capacity: 50,
      description: "Test description",
      operatingHours: "09:00 - 22:00",
      amenities: ["주차", "WiFi"],
    };

    const request = createRequest("http://localhost:3000/api/admin/studios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataWithOptionals),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.data.managerName).toBe("Manager Name");
    expect(data.data.capacity).toBe(50);
    expect(data.data.amenities).toEqual(["주차", "WiFi"]);
  });

  it("should handle server errors gracefully", async () => {
    // Mock JSON parsing to throw error
    const request = createRequest("http://localhost:3000/api/admin/studios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe("스튜디오 등록에 실패했습니다.");
  });

  it("should persist created studio to database", async () => {
    const request = createRequest("http://localhost:3000/api/admin/studios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockStudioFormData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(studioDatabase[data.data.id]).toBeDefined();
    expect(studioDatabase[data.data.id]).toMatchObject({
      name: mockStudioFormData.name,
      tab: mockStudioFormData.tab,
    });
  });
});
