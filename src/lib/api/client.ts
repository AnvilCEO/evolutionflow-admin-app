const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

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
  const res = await fetch(`${API_BASE}${path}`, {
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
