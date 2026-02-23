import { apiGet, apiPost, apiPut } from "./client";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  birthDate?: string;
  gender?: "MALE" | "FEMALE" | "NONE";
  interests?: string[];
  marketingConsent?: boolean;
  role: "MEMBER" | "INSTRUCTOR" | "ADMIN";
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  user: AuthUser;
}

export interface RegisterResponse extends AuthTokens {
  user: Pick<AuthUser, "id" | "email" | "name" | "role">;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return apiPost<LoginResponse>("/auth/login", { email, password });
}

export async function register(data: {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  birthDate?: string;
  gender?: "MALE" | "FEMALE" | "NONE";
  interests?: string[];
  marketingConsent?: boolean;
}): Promise<RegisterResponse> {
  return apiPost<RegisterResponse>("/auth/register", data);
}

export async function logout(
  accessToken: string,
  refreshToken?: string,
): Promise<void> {
  await apiPost("/auth/logout", { refreshToken }, accessToken);
}

export async function refreshTokens(token: string): Promise<AuthTokens> {
  return apiPost<AuthTokens>("/auth/refresh", { refreshToken: token });
}

export async function getMe(accessToken: string): Promise<AuthUser> {
  return apiGet<AuthUser>("/users/me", accessToken);
}

export async function updateMe(
  accessToken: string,
  data: { name?: string; phone?: string },
): Promise<AuthUser> {
  return apiPut<AuthUser>("/users/me", data, accessToken);
}
