import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/server-api";

const apiUrl = API_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("campusflow_session")?.value;
    const upstream = await fetch(`${apiUrl.replace(/\/+$/, "")}/semester/retry-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(await request.json()),
    });
    const result = await upstream.json().catch(() => null);
    return NextResponse.json(result ?? { message: "The payment API returned an invalid response." }, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { message: `Cannot reach the payment API at ${apiUrl}. Check that the backend is running and NEXT_PUBLIC_BKASH_RETRY_ENDPOINT matches its retry route.` },
      { status: 502 },
    );
  }
}
