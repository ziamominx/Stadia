import { NextResponse } from "next/server";
import {
  advance,
  command,
  createState,
  snapshot,
} from "@/lib/operations/engine.mjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const key = Symbol.for("stadia.operations.v2");
function current() {
  if (!globalThis[key]) globalThis[key] = createState();
  return advance(globalThis[key]);
}
export async function GET() {
  return NextResponse.json(snapshot(current()), {
    headers: { "Cache-Control": "no-store" },
  });
}
export async function POST(request) {
  try {
    const action = await request.json();
    globalThis[key] = command(current(), action);
    return NextResponse.json(snapshot(globalThis[key]), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
