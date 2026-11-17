import { NextRequest, NextResponse } from "next/server";

const configuredUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
const apiBase = configuredUrl.replace(/\/+$/, "").endsWith("/api/v1")
  ? configuredUrl.replace(/\/+$/, "")
  : `${configuredUrl.replace(/\/+$/, "")}/api/v1`;

async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await context.params;
    const target = `${apiBase}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
    const token = request.cookies.get("campusflow_session")?.value;
    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    if (token) headers.set("authorization", token.startsWith("Bearer ") ? token : `Bearer ${token}`);
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      ...(request.method === "GET" || request.method === "HEAD" ? {} : { body: await request.arrayBuffer() }),
      cache: "no-store",
    });
    const body = await upstream.arrayBuffer();
    return new NextResponse(body, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ success: false, message: `Cannot reach the university API at ${apiBase}. Check NEXT_PUBLIC_API_URL and that the backend is running.` }, { status: 502 });
  }
}

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const PUT = forward;
export const DELETE = forward;
