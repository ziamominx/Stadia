import { NextResponse } from "next/server";
import {
  advance,
  command,
  createState,
  snapshot,
} from "@/lib/operations/engine.mjs";
import { canCommand, isSameRequestOrigin, readSession, SESSION_COOKIE } from "@/lib/operations/auth.mjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const key = Symbol.for("stadia.operations.v2");
function current() {
  if (!globalThis[key]) globalThis[key] = createState();
  return advance(globalThis[key]);
}
async function currentRole(request) {
  return readSession(request.cookies.get(SESSION_COOKIE)?.value, process.env.STADIA_SESSION_SECRET);
}
function scopedSnapshot(state, role) {
  const result = snapshot(state);
  if (role === "ground" || role === "transport") {
    result.tasks = result.tasks.filter((task) => task.team === role);
    result.incidents = result.incidents.filter((incident) => result.tasks.some((task) => task.incidentId === incident.id));
    result.log = [];
    result.hospitalityRequests = [];
    if (role === "ground") { result.buses = []; result.parking = []; result.facilities = []; }
    if (role === "transport") { result.personnel = []; result.facilities = []; result.approvedRoutes = []; }
  }
  if (role === "hospitality") {
    result.tasks = [];
    result.incidents = [];
    result.log = [];
    result.personnel = [];
    result.buses = [];
    result.parking = [];
    result.zones = [];
    result.exits = [];
    result.hubs = [];
    result.approvedRoutes = [];
    result.weather = null;
  }
  return result;
}
export async function GET(request) {
  const role = await currentRole(request);
  if (!role) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  return NextResponse.json(scopedSnapshot(current(), role), {
    headers: { "Cache-Control": "no-store" },
  });
}
export async function POST(request) {
  try {
    const role = await currentRole(request);
    if (!role) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    const origin = request.headers.get("origin");
    if (!isSameRequestOrigin(origin, request.url, request.headers.get("host"))) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
    const action = await request.json();
    if (!canCommand(role, action, current())) return NextResponse.json({ error: "This action is outside your role." }, { status: 403 });
    globalThis[key] = command(current(), action);
    return NextResponse.json(scopedSnapshot(globalThis[key], role), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
