import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/server-api";
const apiUrl = API_BASE_URL;
export async function POST(request: NextRequest) { const upstream = await fetch(`${apiUrl}/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(await request.json()) }); return NextResponse.json(await upstream.json(), { status: upstream.status }); }
