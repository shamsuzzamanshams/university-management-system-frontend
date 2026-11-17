const configuredUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
export const API_URL = configuredUrl.replace(/\/+$/, "").endsWith("/api/v1")
  ? configuredUrl.replace(/\/+$/, "")
  : `${configuredUrl.replace(/\/+$/, "")}/api/v1`;

export type ApiEnvelope<T> = { success?: boolean; data: T; message?: string; meta?: unknown };

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/backend/${path.replace(/^\/+/, "")}`, {
    ...init,
    headers: { ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success === false) {
    throw new Error(result?.message ?? `Request failed (${response.status})`);
  }
  return (result && Object.prototype.hasOwnProperty.call(result, "data") ? result.data : result) as T;
}

export const api = <T>(path: string) => request<T>(path);
