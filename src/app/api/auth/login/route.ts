import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/server-api";
const apiUrl = API_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const upstream = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await upstream.json().catch(() => null);

    if (!upstream.ok) {
      return NextResponse.json(
        { message: result?.message ?? "Email or password is incorrect." },
        { status: upstream.status },
      );
    }

    const token = result?.data?.accessToken;
    if (typeof token !== "string" || !token) {
      return NextResponse.json(
        { message: "The API accepted the login but did not return an access token." },
        { status: 502 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set("campusflow_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json(
      { message: `Cannot reach the authentication API at ${apiUrl}. Check that the backend is running and NEXT_PUBLIC_API_URL is correct.` },
      { status: 502 },
    );
  }
}
