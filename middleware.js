import { NextResponse } from "next/server";
import { canAccess, readSession, roleHome, routeRole, SESSION_COOKIE } from "./lib/operations/auth.mjs";

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  const secret = process.env.STADIA_SESSION_SECRET;
  const role = await readSession(request.cookies.get(SESSION_COOKIE)?.value, secret);
  if (path === "/login") return role ? NextResponse.redirect(new URL(roleHome[role], request.url)) : NextResponse.next();
  if (path === "/api/operations" || path.startsWith("/api/orchestration/") || path.startsWith("/api/dashboard/") || path === "/api/referrals/summary") {
    if (!role) return NextResponse.json({ error: "Sign in to access operations." }, { status: 401 });
    if (path !== "/api/operations" && role !== "executive") return NextResponse.json({ error: "Executive access required." }, { status: 403 });
    return NextResponse.next();
  }
  if (path.startsWith("/api/hospitality/")) {
    if (!role) return NextResponse.json({ error: "Sign in to access hospitality." }, { status: 401 });
    if (role !== "executive" && role !== "hospitality") return NextResponse.json({ error: "Hospitality access required." }, { status: 403 });
    return NextResponse.next();
  }
  if (routeRole(path)) {
    if (!role) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(path)}`, request.url));
    if (!canAccess(role, path)) return NextResponse.redirect(new URL(roleHome[role], request.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ["/login", "/command-center/:path*", "/crowd/:path*", "/ground/:path*", "/transport/:path*", "/hospitality/:path*", "/incidents/:path*", "/event-control/:path*", "/setup/:path*", "/analytics/:path*", "/organizer/:path*", "/admin/:path*", "/simulator/:path*", "/api/operations", "/api/orchestration/:path*", "/api/dashboard/:path*", "/api/hospitality/:path*", "/api/referrals/summary"] };
