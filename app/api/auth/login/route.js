import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ error: "Use /api/ops-session for role-based sign in." }, { status: 410 });
}
