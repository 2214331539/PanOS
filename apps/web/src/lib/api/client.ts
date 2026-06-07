import type { ApiEnvelope, DesktopBootstrap } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

async function request<TData>(path: string, init?: RequestInit): Promise<TData> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`PanOS API request failed: ${response.status}`);
  }

  const body = (await response.json()) as ApiEnvelope<TData>;
  return body.data;
}

export function getDesktopBootstrap() {
  return request<DesktopBootstrap>("/desktop/bootstrap");
}

export interface ContactPayload {
  name: string;
  email: string;
  topic?: string;
  message: string;
}

export function submitContact(payload: ContactPayload) {
  return request<{ id: string; status: "new" }>("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

