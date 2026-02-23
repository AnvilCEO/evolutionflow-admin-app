const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const BACKEND_API_ORIGIN = process.env.BACKEND_API_ORIGIN ?? "https://evolutionflow-dev-api.vercel.app/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // For server-side rendering, use direct backend URL
  // For client-side, use direct API URL
  const url = typeof window === "undefined"
    ? `${BACKEND_API_ORIGIN}${path}`
    : `${API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? res.statusText);
  }

  return res.json();
}

export function apiGet<T>(path: string, token?: string): Promise<T> {
  return request<T>(path, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
}

export function apiPost<T>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function apiPut<T>(
  path: string,
  body: unknown,
  token: string,
): Promise<T> {
  return request<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function apiPatch<T>(
  path: string,
  body: unknown,
  token: string,
): Promise<T> {
  return request<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function apiDelete<T>(
  path: string,
  token: string,
): Promise<T> {
  return request<T>(path, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
