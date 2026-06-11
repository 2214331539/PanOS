const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";
const TOKEN_KEY = "panos-admin-token";

export interface ApiEnvelope<TData> {
  data: TData;
  meta?: Record<string, unknown>;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

interface CallOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

async function call<TData>(path: string, options: CallOptions = {}): Promise<ApiEnvelope<TData>> {
  const headers: Record<string, string> = {};
  const isForm = options.body instanceof FormData;
  if (!isForm && options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.auth) {
    const token = getStoredToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let body: BodyInit | undefined;
  if (isForm) body = options.body as FormData;
  else if (options.body !== undefined) body = JSON.stringify(options.body);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body,
  });

  if (response.status === 401 && options.auth) {
    setStoredToken(null);
  }

  if (!response.ok) {
    let message = `请求失败 (${response.status})`;
    try {
      const errorBody = (await response.json()) as { error?: { message?: string } };
      message = errorBody.error?.message ?? message;
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return { data: undefined as TData };
  }

  return (await response.json()) as ApiEnvelope<TData>;
}

export function apiGet<TData>(path: string, opts?: { auth?: boolean }): Promise<ApiEnvelope<TData>> {
  return call<TData>(path, { method: "GET", auth: opts?.auth });
}

export function apiSend<TData>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
  opts?: { auth?: boolean },
): Promise<ApiEnvelope<TData>> {
  return call<TData>(path, { method, body, auth: opts?.auth });
}

export interface UploadResult {
  id: string;
  url: string;
  width?: number;
  height?: number;
}

export async function uploadFile(path: string, file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  const result = await call<UploadResult>(path, { method: "POST", body: form, auth: true });
  return result.data;
}

export interface ContactPayload {
  name: string;
  email: string;
  topic?: string;
  message: string;
}

export async function submitContact(
  payload: ContactPayload,
): Promise<{ id: string; status: "new" }> {
  const result = await call<{ id: string; status: "new" }>("/contact", {
    method: "POST",
    body: payload,
  });
  return result.data;
}
