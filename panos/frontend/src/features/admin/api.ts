import { apiSend } from "@/shared/lib/api/client";

interface LoginResult {
  accessToken: string;
  expiresAt: string;
}

export async function login(username: string, password: string): Promise<string> {
  const res = await apiSend<LoginResult>("/admin/login", "POST", { username, password });
  return res.data.accessToken;
}
