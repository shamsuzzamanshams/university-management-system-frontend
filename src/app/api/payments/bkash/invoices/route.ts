import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/server-api";

const apiUrl = API_BASE_URL;

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("campusflow_session")?.value;
    const upstream = await fetch(`${apiUrl.replace(/\/+$/, "")}/payment/my-payments?sortBy=dueDate&sortOrder=desc`, {
      headers: token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {},
      cache: "no-store",
    });
    const result = await upstream.json().catch(() => null);
    return NextResponse.json(result ?? { message: "The payments API returned an invalid response." }, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { message: `Cannot reach the payments API at ${apiUrl}. Check that the backend is running and NEXT_PUBLIC_API_URL is correct.` },
      { status: 502 },
    );
  }
}
