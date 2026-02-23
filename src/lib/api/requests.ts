import { apiPost } from "./client";

/**
 * 강사 지원 요청 (Request for Teacher)
 */
export interface TeacherRequestData {
  name: string;
  birthDate: string;
  phone: string;
  email: string;
  snsUrl: string;
  profilePhoto?: File;
  experience: string;
  introduction: string;
}

export interface TeacherRequestResponse {
  id: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export async function submitTeacherRequest(
  data: TeacherRequestData,
  accessToken: string,
): Promise<TeacherRequestResponse> {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("birthDate", data.birthDate);
  formData.append("phone", data.phone);
  formData.append("email", data.email);
  formData.append("snsUrl", data.snsUrl);
  formData.append("experience", data.experience);
  formData.append("introduction", data.introduction);
  if (data.profilePhoto) {
    formData.append("profilePhoto", data.profilePhoto);
  }

  return apiPost<TeacherRequestResponse>(
    "/requests/teacher",
    formData,
    accessToken,
  );
}

/**
 * 워크샵 등록 요청 (Request Workshop)
 */
export interface WorkshopRequestData {
  title: string;
  instructorName: string;
  date: string;
  time: string;
  price: number;
  capacity: number;
  thumbnail?: File;
  description: string;
}

export interface WorkshopRequestResponse {
  id: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export async function submitWorkshopRequest(
  data: WorkshopRequestData,
  accessToken: string,
): Promise<WorkshopRequestResponse> {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("instructorName", data.instructorName);
  formData.append("date", data.date);
  formData.append("time", data.time);
  formData.append("price", data.price.toString());
  formData.append("capacity", data.capacity.toString());
  formData.append("description", data.description);
  if (data.thumbnail) {
    formData.append("thumbnail", data.thumbnail);
  }

  return apiPost<WorkshopRequestResponse>(
    "/requests/workshop",
    formData,
    accessToken,
  );
}

/**
 * 스케줄 등록 요청 (Request Schedule)
 */
export interface ScheduleRequestData {
  classType: "regular" | "special" | "ttc";
  className: string;
  instructorName: string;
  startDate: string;
  timeInfo: string;
  capacity: number;
  locationInfo: string;
  classDesc: string;
  classImage?: File;
}

export interface ScheduleRequestResponse {
  id: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export async function submitScheduleRequest(
  data: ScheduleRequestData,
  accessToken: string,
): Promise<ScheduleRequestResponse> {
  const formData = new FormData();
  formData.append("classType", data.classType);
  formData.append("className", data.className);
  formData.append("instructorName", data.instructorName);
  formData.append("startDate", data.startDate);
  formData.append("timeInfo", data.timeInfo);
  formData.append("capacity", data.capacity.toString());
  formData.append("locationInfo", data.locationInfo);
  formData.append("classDesc", data.classDesc);
  if (data.classImage) {
    formData.append("classImage", data.classImage);
  }

  return apiPost<ScheduleRequestResponse>(
    "/requests/schedule",
    formData,
    accessToken,
  );
}

/**
 * 내 신청 조회 (Teacher Request)
 */
export interface MyTeacherRequestsResponse {
  data: TeacherRequestResponse[];
  total: number;
  page: number;
  limit: number;
}

export async function getMyTeacherRequests(
  accessToken: string,
  page: number = 1,
  limit: number = 10,
  status?: "pending" | "approved" | "rejected",
): Promise<MyTeacherRequestsResponse> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (status) params.append("status", status);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/requests/teacher/me?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("신청 조회에 실패했습니다.");
  }

  return response.json();
}

/**
 * 내 신청 조회 (Workshop Request)
 */
export interface MyWorkshopRequestsResponse {
  data: WorkshopRequestResponse[];
  total: number;
  page: number;
  limit: number;
}

export async function getMyWorkshopRequests(
  accessToken: string,
  page: number = 1,
  limit: number = 10,
  status?: "pending" | "approved" | "rejected",
): Promise<MyWorkshopRequestsResponse> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (status) params.append("status", status);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/requests/workshop/me?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("신청 조회에 실패했습니다.");
  }

  return response.json();
}

/**
 * 내 신청 조회 (Schedule Request)
 */
export interface MyScheduleRequestsResponse {
  data: ScheduleRequestResponse[];
  total: number;
  page: number;
  limit: number;
}

export async function getMyScheduleRequests(
  accessToken: string,
  page: number = 1,
  limit: number = 10,
  status?: "pending" | "approved" | "rejected",
): Promise<MyScheduleRequestsResponse> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (status) params.append("status", status);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/requests/schedule/me?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("신청 조회에 실패했습니다.");
  }

  return response.json();
}

/**
 * 모든 신청 조회 (Teacher - Admin only)
 */
export interface AllTeacherRequestsResponse {
  data: (TeacherRequestResponse & { user: { id: string; email: string; name?: string } })[];
  total: number;
  page: number;
  limit: number;
}

export async function getAllTeacherRequests(
  accessToken: string,
  page: number = 1,
  limit: number = 10,
  status?: "pending" | "approved" | "rejected",
): Promise<AllTeacherRequestsResponse> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (status) params.append("status", status);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/requests/teacher?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("신청 조회에 실패했습니다.");
  }

  return response.json();
}

/**
 * 모든 신청 조회 (Workshop - Admin only)
 */
export interface AllWorkshopRequestsResponse {
  data: (WorkshopRequestResponse & { user: { id: string; email: string } })[];
  total: number;
  page: number;
  limit: number;
}

export async function getAllWorkshopRequests(
  accessToken: string,
  page: number = 1,
  limit: number = 10,
  status?: "pending" | "approved" | "rejected",
): Promise<AllWorkshopRequestsResponse> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (status) params.append("status", status);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/requests/workshop?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("신청 조회에 실패했습니다.");
  }

  return response.json();
}

/**
 * 모든 신청 조회 (Schedule - Admin only)
 */
export interface AllScheduleRequestsResponse {
  data: (ScheduleRequestResponse & { user: { id: string; email: string } })[];
  total: number;
  page: number;
  limit: number;
}

export async function getAllScheduleRequests(
  accessToken: string,
  page: number = 1,
  limit: number = 10,
  status?: "pending" | "approved" | "rejected",
): Promise<AllScheduleRequestsResponse> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (status) params.append("status", status);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/requests/schedule?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("신청 조회에 실패했습니다.");
  }

  return response.json();
}

/**
 * 신청 승인 (Teacher)
 */
export async function approveTeacherRequest(
  id: string,
  accessToken: string,
): Promise<TeacherRequestResponse & { message: string }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/requests/teacher/${id}/approve`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("신청 승인에 실패했습니다.");
  }

  return response.json();
}

/**
 * 신청 거절 (Teacher)
 */
export async function rejectTeacherRequest(
  id: string,
  accessToken: string,
): Promise<TeacherRequestResponse & { message: string }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/requests/teacher/${id}/reject`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("신청 거절에 실패했습니다.");
  }

  return response.json();
}

/**
 * 신청 승인 (Workshop)
 */
export async function approveWorkshopRequest(
  id: string,
  accessToken: string,
): Promise<WorkshopRequestResponse & { message: string; workshop: any }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/requests/workshop/${id}/approve`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("신청 승인에 실패했습니다.");
  }

  return response.json();
}

/**
 * 신청 거절 (Workshop)
 */
export async function rejectWorkshopRequest(
  id: string,
  accessToken: string,
): Promise<WorkshopRequestResponse & { message: string }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/requests/workshop/${id}/reject`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("신청 거절에 실패했습니다.");
  }

  return response.json();
}

/**
 * 신청 승인 (Schedule)
 */
export async function approveScheduleRequest(
  id: string,
  accessToken: string,
): Promise<ScheduleRequestResponse & { message: string; schedule: any }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/requests/schedule/${id}/approve`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("신청 승인에 실패했습니다.");
  }

  return response.json();
}

/**
 * 신청 거절 (Schedule)
 */
export async function rejectScheduleRequest(
  id: string,
  accessToken: string,
): Promise<ScheduleRequestResponse & { message: string }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/requests/schedule/${id}/reject`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("신청 거절에 실패했습니다.");
  }

  return response.json();
}

/**
 * 문의 제출 (Contact)
 */
export interface ContactData {
  contactType: "partnership" | "teacher" | "workshop";
  company: string;
  department?: string;
  position?: string;
  name: string;
  phone: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  id: string;
  status: "received";
  createdAt: string;
}

export async function submitContact(
  data: ContactData,
): Promise<ContactResponse> {
  return apiPost<ContactResponse>("/requests/contact", data);
}
