import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/server-api";

const apiUrl = API_BASE_URL;

export async function GET() {
  try {
    const baseUrl = apiUrl.replace(/\/+$/, "");
    const upstream = await fetch(`${baseUrl}/semester`, { cache: "no-store" });
    const result = await upstream.json().catch(() => null);
    return NextResponse.json(result ?? { message: "The semester API returned an invalid response." }, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { message: `Cannot reach the semester API at ${apiUrl}. Check that the backend is running and NEXT_PUBLIC_API_URL is correct.` },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("campusflow_session")?.value;
    const baseUrl = apiUrl.replace(/\/+$/, "");
    const paymentUrl = `${baseUrl}/semester/initiate`;
    const body = await request.json();
    body.amount = Number(process.env.SEMESTER_REGISTRATION_AMOUNT ?? process.env.NEXT_PUBLIC_SEMESTER_REGISTRATION_AMOUNT ?? 420);
    const upstream = await fetch(paymentUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const result = await upstream.json().catch(() => null);
    if (upstream.status === 404) {
      return NextResponse.json(
        {
          message: `Payment route not found: POST ${paymentUrl}.`,
          backendMessage: result?.message ?? result?.error,
        },
        { status: 404 },
      );
    }
    return NextResponse.json(
      result ?? { message: "The payment API returned an invalid response." },
      { status: upstream.status },
    );
  } catch {
    return NextResponse.json(
      { message: `Cannot reach the payment API at ${apiUrl}. Check that the backend is running and NEXT_PUBLIC_BKASH_CHECKOUT_ENDPOINT matches its create-payment route.` },
      { status: 502 },
    );
  }
}
