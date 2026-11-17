import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/server-api";
const apiUrl = API_BASE_URL;
export async function POST(request: NextRequest) { const upstream = await fetch(`${apiUrl}/auth/google`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) }); const result = await upstream.json(); if (!upstream.ok) return NextResponse.json(result, { status: upstream.status }); const response = NextResponse.json({ ok: true }); response.cookies.set("campusflow_session", result.data?.accessToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 86400, path: "/" }); return response; }
