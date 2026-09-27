"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("executive");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/ops-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Sign in failed.");
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : data.home);
      router.refresh();
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  return <main className="ops-login">
    <Link href="/" className="ops-login-brand">STADIA ●</Link>
    <form onSubmit={submit} className="ops-login-panel">
      <span className="ops-login-kicker">ROLE-BASED OPERATIONS ACCESS</span>
      <h1>Enter the event.</h1>
      <p>Sign in with your assigned operations role. The executive account controls the full platform; team accounts open only their console.</p>
      <label>Assigned role<select value={role} onChange={(event) => setRole(event.target.value)}><option value="executive">Executive</option><option value="ground">Ground team</option><option value="transport">Transport team</option><option value="hospitality">Hospitality team</option></select></label>
      <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      {error && <p role="alert" className="ops-login-error">{error}</p>}
      <button type="submit" disabled={busy}>{busy ? "Signing in…" : "Open my console ↗"}</button>
    </form>
  </main>;
}
