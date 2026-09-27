export const SESSION_COOKIE = "stadia_ops_session";
export const roleHome = { executive: "/command-center", ground: "/ground", transport: "/transport", hospitality: "/hospitality" };
export const executivePaths = ["/command-center", "/crowd", "/incidents", "/event-control", "/setup", "/analytics", "/ml", "/organizer", "/admin", "/simulator"];

export function isSameRequestOrigin(origin, requestUrl, hostHeader) {
  if (!origin) return true;
  try {
    const supplied = new URL(origin);
    const target = new URL(requestUrl);
    if (supplied.protocol !== target.protocol) return false;
    if (supplied.host === target.host || supplied.host === hostHeader) return true;
    const loopback = new Set(["localhost", "127.0.0.1", "[::1]"]);
    return loopback.has(supplied.hostname) &&
      loopback.has(target.hostname) &&
      supplied.port === target.port;
  } catch {
    return false;
  }
}

export function routeRole(pathname) {
  if (executivePaths.some((path) => pathname === path || pathname.startsWith(path + "/"))) return "executive";
  if (pathname === "/ground") return "ground";
  if (pathname === "/transport") return "transport";
  if (pathname === "/hospitality") return "hospitality";
  return null;
}
export function canAccess(role, pathname) {
  const required = routeRole(pathname);
  return !required || role === "executive" || role === required;
}
export function canCommand(role, action, state) {
  if (role === "executive") return true;
  if (role === "ground") {
    if (!["task", "flag"].includes(action.type)) return false;
    return state.tasks.some((task) => task.id === action.id && task.team === "ground");
  }
  if (role === "transport") {
    if (action.type === "reserve" || action.type === "parking") return true;
    if (!["task", "flag"].includes(action.type)) return false;
    return state.tasks.some((task) => task.id === action.id && task.team === "transport");
  }
  return role === "hospitality" && action.type === "hospitality_request";
}
const encoder = new TextEncoder();
function base64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
async function signature(payload, secret) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload))));
}
export async function issueSession(role, secret, now = Date.now()) {
  const payload = base64url(encoder.encode(JSON.stringify({ role, expires: now + 8 * 60 * 60 * 1000 })));
  return `${payload}.${await signature(payload, secret)}`;
}
export async function readSession(value, secret, now = Date.now()) {
  if (!value || !secret) return null;
  const [payload, tag, extra] = value.split(".");
  if (!payload || !tag || extra) return null;
  const expected = await signature(payload, secret);
  if (expected.length !== tag.length) return null;
  let difference = 0;
  for (let i = 0; i < tag.length; i++) difference |= expected.charCodeAt(i) ^ tag.charCodeAt(i);
  if (difference) return null;
  try {
    const data = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(payload.replaceAll("-", "+").replaceAll("_", "/")), (character) => character.charCodeAt(0))));
    return roleHome[data.role] && Number.isFinite(data.expires) && data.expires > now ? data.role : null;
  } catch { return null; }
}
