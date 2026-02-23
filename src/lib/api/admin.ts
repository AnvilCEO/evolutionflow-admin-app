import { apiGet, apiPut, apiPost, apiDelete, apiPatch } from "./client";

/**
 * Admin Member Management API Functions
 */

export interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  gender?: "MALE" | "FEMALE" | "NONE";
  interests?: string[];
  marketingConsent?: boolean;
  registrationDate: string;
  lastLogin?: string;
  membershipLevel: "general" | "instructor" | "premium";
  status: "active" | "inactive" | "suspended";
  profileCompleteness?: number;
}

export interface MembersListResponse {
  data: Member[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MemberDetailResponse {
  data: Member;
}

export interface ActivityLog {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface ActivityLogsResponse {
  data: ActivityLog[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MembershipStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  suspendedMembers: number;
  generalMembers: number;
  instructorMembers: number;
  premiumMembers: number;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

/**
 * Get all members with pagination and filters
 */
export async function getAdminMembers(
  accessToken: string,
  params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    membershipLevel?: string;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
  } = {}
): Promise<MembersListResponse> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", String(params.page));
  if (params.pageSize) queryParams.append("pageSize", String(params.pageSize));
  if (params.search) queryParams.append("search", params.search);
  if (params.status) queryParams.append("status", params.status);
  if (params.membershipLevel) queryParams.append("membershipLevel", params.membershipLevel);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortDirection) queryParams.append("sortDirection", params.sortDirection);

  const queryString = queryParams.toString();
  const path = `/users${queryString ? `?${queryString}` : ""}`;
  const response = await apiGet<any>(path, accessToken);

  // Map backend User to frontend Member
  return {
    ...response,
    data: response.data.map((u: any) => ({
      ...u,
      registrationDate: u.createdAt,
      membershipLevel: u.role === 'ADMIN' ? 'premium' : u.role === 'INSTRUCTOR' ? 'instructor' : 'general',
      status: u.isActive ? 'active' : 'inactive',
    })),
  };
}

/**
 * Get member detail by ID
 */
export async function getAdminMember(
  id: string,
  accessToken: string
): Promise<MemberDetailResponse> {
  const user = await apiGet<any>(`/users/${id}`, accessToken);
  return {
    data: {
      ...user,
      registrationDate: user.createdAt,
      membershipLevel: user.role === 'ADMIN' ? 'premium' : user.role === 'INSTRUCTOR' ? 'instructor' : 'general',
      status: user.isActive ? 'active' : 'inactive',
    }
  };
}


/**
 * Update member status
 */
export async function updateMemberStatus(
  id: string,
  status: "active" | "inactive" | "suspended",
  accessToken: string
): Promise<MemberDetailResponse> {
  return apiPut(
    `/api/admin/members/${id}`,
    { status },
    accessToken
  );
}

/**
 * Update member information
 */
export async function updateMember(
  id: string,
  data: Partial<Member>,
  accessToken: string
): Promise<MemberDetailResponse> {
  return apiPatch(`/users/${id}`, data, accessToken);
}

/**
 * Delete member (soft delete - updates status to inactive)
 */
export async function deleteMember(
  id: string,
  accessToken: string
): Promise<DeleteResponse> {
  return apiDelete(`/users/${id}`, accessToken);
}

/**
 * Get member activity logs
 */
export async function getMemberActivityLogs(
  memberId: string,
  accessToken: string,
  params: {
    page?: number;
    pageSize?: number;
  } = {}
): Promise<ActivityLogsResponse> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", String(params.page));
  if (params.pageSize) queryParams.append("pageSize", String(params.pageSize));

  const queryString = queryParams.toString();
  const url = `/users/${memberId}/activity${
    queryString ? `?${queryString}` : ""
  }`;

  return apiGet(url, accessToken);
}

/**
 * Get membership statistics
 */
export async function getMembershipStats(
  accessToken: string
): Promise<MembershipStats> {
  return apiGet("/api/admin/members/stats", accessToken);
}

/**
 * Admin Instructor (Teacher) Management API Interfaces
 * Aligned with evolutionflow-site-app_Cloude
 */

export interface TeacherContent {
  code: string;
  userId?: string;
  level: "LEVEL_1" | "LEVEL_2" | "LEVEL_3";
  grade: "I" | "WE" | "EARTH" | "UNIVERSE";
  country: "KR" | "CN";
  name: string;
  tagline: string;
  career: string[]; // Dynamic List
  sns: "instagram" | "wechat" | "youtube";
  imageUrl?: string;
  detailImageUrl?: string;
  pcSnsAndCareerColorIsWhite: boolean;
  isActive: boolean;
  sortOrder: number;
}

export async function getAdminInstructors(
  accessToken: string,
  params: {
    page?: number;
    limit?: number;
    grade?: string;
    country?: string;
    search?: string;
  } = {}
): Promise<{ data: TeacherContent[]; total: number; page: number; limit: number }> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", String(params.page));
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.grade) queryParams.append("grade", params.grade);
  if (params.country) queryParams.append("country", params.country);
  if (params.search) queryParams.append("search", params.search);

  const queryString = queryParams.toString();
  const path = `/teachers${queryString ? `?${queryString}` : ""}`;

  return apiGet(path, accessToken);
}

export async function getAdminInstructor(code: string, accessToken: string): Promise<{ data: TeacherContent }> {
  return apiGet<{ data: TeacherContent }>(`/teachers/${code}`, accessToken);
}

export async function createAdminInstructor(data: any, accessToken: string): Promise<{ data: TeacherContent }> {
  return apiPost<{ data: TeacherContent }>("/teachers", data, accessToken);
}

export async function updateAdminInstructor(code: string, data: any, accessToken: string): Promise<{ data: TeacherContent }> {
  return apiPatch<{ data: TeacherContent }>(`/teachers/${code}`, data, accessToken);
}

export async function deleteAdminInstructor(code: string, accessToken: string): Promise<DeleteResponse> {
  return apiDelete<DeleteResponse>(`/teachers/${code}`, accessToken);
}

/**
 * Admin Workshop Management API Interfaces
 */

export interface WorkshopContent {
  id: string;
  title: string;
  instructorName: string;
  level: "ALL" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  startDate: string;
  endDate: string;
  timeInfo: string;
  locationInfo: string;
  capacity: number;
  currentApplicants: number;
  price: number;
  status: "OPEN" | "CLOSED" | "CANCELLED" | "COMPLETED";
  imageUrl?: string;
  category: "VINYASA" | "HATHA" | "ASHTANGA" | "THERAPY" | "SPECIAL" | "OTHER";
  description: string;
  notes: string[];
  refundPolicy: string;
  isActive: boolean;
}

export async function getAdminWorkshops(
  accessToken: string,
  params: {
    page?: number;
    limit?: number;
    status?: string;
    level?: string;
    search?: string;
  } = {}
): Promise<{ data: WorkshopContent[]; total: number; page: number; limit: number }> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", String(params.page));
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.status) queryParams.append("status", params.status);
  if (params.level) queryParams.append("level", params.level);
  if (params.search) queryParams.append("search", params.search);

  const queryString = queryParams.toString();
  const path = `/workshops${queryString ? `?${queryString}` : ""}`;
  const response = await apiGet<any>(path, accessToken);

  // Map backend response to WorkshopContent interface
  return {
    ...response,
    data: response.data.map((w: any) => ({
      ...w,
      instructorName: w.instructor?.name || "N/A",
      currentApplicants: w.enrolled || 0,
    })),
  };
}

export async function getAdminWorkshop(id: string, accessToken: string): Promise<{ data: WorkshopContent }> {
  return apiGet<{ data: WorkshopContent }>(`/workshops/${id}`, accessToken);
}

export async function createAdminWorkshop(data: any, accessToken: string): Promise<{ data: WorkshopContent }> {
  return apiPost<{ data: WorkshopContent }>("/workshops", data, accessToken);
}

export async function updateAdminWorkshop(id: string, data: any, accessToken: string): Promise<{ data: WorkshopContent }> {
  return apiPatch<{ data: WorkshopContent }>(`/workshops/${id}`, data, accessToken);
}

export async function deleteAdminWorkshop(id: string, accessToken: string): Promise<DeleteResponse> {
  return apiDelete<DeleteResponse>(`/workshops/${id}`, accessToken);
}

/**
 * Admin Schedule Management API Interfaces
 */

export interface ScheduleContent {
  id: string;
  classType: "REGULAR" | "TTC" | "SPECIAL";
  className: string;
  instructorName: string;
  startDate: string;
  endDate: string;
  timeInfo: string;
  days: ("월" | "화" | "수" | "목" | "금" | "토" | "일")[];
  capacity: number;
  currentApplicants: number;
  price: number;
  locationInfo: string;
  classDesc: string;
  imageUrl?: string;
  status: "OPEN" | "FULL" | "WAITLIST" | "CANCELLED";
  isActive: boolean;
}

export async function getAdminSchedules(
  accessToken: string,
  params: {
    page?: number;
    limit?: number;
    search?: string;
    classType?: string;
    status?: string;
    month?: string; // e.g. "2024-05"
  } = {}
): Promise<{ data: ScheduleContent[]; total: number; page: number; limit: number }> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", String(params.page));
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.search) queryParams.append("search", params.search);
  if (params.classType) queryParams.append("classType", params.classType);
  if (params.status) queryParams.append("status", params.status);
  if (params.month) queryParams.append("month", params.month);

  const queryString = queryParams.toString();
  const path = `/schedules${queryString ? `?${queryString}` : ""}`;
  const response = await apiGet<any>(path, accessToken);

  // Map backend response to ScheduleContent interface
  return {
    ...response,
    data: response.data.map((s: any) => ({
      ...s,
      className: s.title,
      classType: (s.type || "REGULAR").toUpperCase(),
      instructorName: s.instructor?.name || "N/A",
      currentApplicants: s.enrolled || 0,
      startDate: s.date ? s.date.split('T')[0] : s.startDate,
      endDate: s.endDate || s.date?.split('T')[0],
      days: s.days || [],
      timeInfo: s.timeInfo || `${s.startTime || ""} - ${s.endTime || ""}`,
    })),
  };
}

export async function getAdminSchedule(id: string, accessToken: string): Promise<{ data: ScheduleContent }> {
  return apiGet<{ data: ScheduleContent }>(`/schedules/${id}`, accessToken);
}

export async function createAdminSchedule(data: any, accessToken: string): Promise<{ data: ScheduleContent }> {
  return apiPost<{ data: ScheduleContent }>("/schedules", data, accessToken);
}

export async function updateAdminSchedule(id: string, data: any, accessToken: string): Promise<{ data: ScheduleContent }> {
  return apiPatch<{ data: ScheduleContent }>(`/schedules/${id}`, data, accessToken);
}

export async function deleteAdminSchedule(id: string, accessToken: string): Promise<DeleteResponse> {
  return apiDelete<DeleteResponse>(`/schedules/${id}`, accessToken);
}

/**
 * Admin Inquiry (Contact) Management API Interfaces
 */

export interface ContactContent {
  id: string;
  contactType: "partnership" | "teacher" | "workshop";
  company: string;
  department?: string;
  position?: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: "received" | "reviewing" | "completed";
  createdAt: string;
}

export async function getAdminContacts(
  accessToken: string,
  params: {
    page?: number;
    limit?: number;
    contactType?: string;
    status?: string;
    search?: string;
  } = {}
): Promise<{ data: ContactContent[] }> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", String(params.page));
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.contactType) queryParams.append("contactType", params.contactType);
  if (params.status) queryParams.append("status", params.status);
  if (params.search) queryParams.append("search", params.search);

  const queryString = queryParams.toString();
  const path = `/requests/contact${queryString ? `?${queryString}` : ""}`;
  return apiGet(path, accessToken);
}

export async function updateAdminContactStatus(
  id: string,
  status: "received" | "reviewing" | "completed",
  accessToken: string
) {
  return apiPatch(`/requests/contact/${id}/status`, { status }, accessToken);
}
