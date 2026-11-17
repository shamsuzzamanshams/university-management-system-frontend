const configuredUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
export const API_BASE_URL = configuredUrl.replace(/\/+$/, "").endsWith("/api/v1")
  ? configuredUrl.replace(/\/+$/, "")
  : `${configuredUrl.replace(/\/+$/, "")}/api/v1`;
