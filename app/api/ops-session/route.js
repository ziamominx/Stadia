import { NextResponse } from "next/server";
import { isSameRequestOrigin, issueSession, readSession, roleHome, SESSION_COOKIE } from "@/lib/operations/auth.mjs";
export const runtime = "nodejs";
export async function GET(request) {
  const role = await readSession(request.cookies.get(SESSION_COOKIE)?.value, process.env.STADIA_SESSION_SECRET);
  return NextResponse.json({ role }, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request) {
  const origin = request.headers.get("origin");
  if (!isSameRequestOrigin(origin, request.url, request.headers.get("host"))) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  const { role, password } = await request.json();
  if (!roleHome[role] || !process.env.STADIA_SESSION_SECRET || process.env.STADIA_SESSION_SECRET.length < 32) return NextResponse.json({ error: "Operations authentication is not configured." }, { status: 503 });
  const expected = process.env[`STADIA_${role.toUpperCase()}_PASSWORD`];
  if (!expected || !password || password !== expected) return NextResponse.json({ error: "Invalid role or password." }, { status: 401 });
  const response = NextResponse.json({ role, home: roleHome[role] });
  response.cookies.set(SESSION_COOKIE, await issueSession(role, process.env.STADIA_SESSION_SECRET), { httpOnly: true, sameSite: "lax", secure: request.nextUrl.protocol === "https:", path: "/", maxAge: 8 * 60 * 60 });
  return response;
}
export async function DELETE(request) {
  const origin = request.headers.get("origin");
  if (!isSameRequestOrigin(origin, request.url, request.headers.get("host"))) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
