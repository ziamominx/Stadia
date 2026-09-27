"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OperationsProvider, useOperations } from "./OperationsProvider";
import { Badge, Button, clock, Modal } from "./UI";
import { canAccess } from "@/lib/operations/auth.mjs";
const links = [
  ["/command-center", "Command Center"],
  ["/stadium", "Stadium"],
  ["/street-map", "Street Map"],
  ["/crowd", "Crowd"],
  ["/ground", "Ground"],
  ["/transport", "Transport"],
  ["/hospitality", "Hospitality"],
  ["/incidents", "Incidents"],
  ["/event-control", "Event Control"],
  ["/setup", "Event Setup"],
  ["/analytics", "Analytics"],
];
function Frame({ children, theme, onToggleTheme }) {
  const { state, send, busy, role } = useOperations();
  const path = usePathname(),
    router = useRouter();
  const [broadcast, setBroadcast] = useState(false),
    [message, setMessage] = useState(
      "Please follow staff directions and use the East Gate approach.",
    );
  return (
    <>
      <a href="#ops-main" className="ops-skip">
        Skip to content
      </a>
      <header className="ops-header">
        <Link href="/" className="ops-brand" aria-label="STADIA — landing page">
          STADIA<span>●</span>
        </Link>
        <button className="ops-theme-toggle" type="button" onClick={onToggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} aria-pressed={theme === "light"}>
          <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
        <div className="ops-event">
          <strong>{state?.event.name || "Event command"}</strong>
          <span>{state?.event.date ? `${state.event.date} · ` : ""}{state?.event.venue || "Connecting to venue"}</span>
        </div>
        <div className="ops-header-right">
          <Badge tone={state?.posture || "normal"}>
            {state?.posture || "connecting"}
          </Badge>
          <span className="ops-clock">
            {clock(state?.minute || 0, state?.event.startTime)} <small>SIM / IST</small>
          </span>
          {role === "executive" && <Button onClick={() => setBroadcast(true)}>↗ PA Broadcast</Button>}
          <span className="ops-kicker">{role || "Connecting"}</span>
          <Button onClick={async () => { await fetch("/api/ops-session", { method: "DELETE" }); router.replace("/login"); router.refresh(); }}>Sign out</Button>
        </div>
      </header>
      <nav className="ops-nav" aria-label="Operations">
        {links.filter(([href]) => role && canAccess(role, href)).map(([href, title]) => (
          <Link
            href={href}
            key={href}
            aria-current={path === href ? "page" : undefined}
          >
            {title}
            {title === "Incidents" &&
              !!state?.incidents.filter((i) => i.status !== "resolved")
                .length && (
                <span className="ops-nav-count">
                  {
                    state.incidents.filter((i) => i.status !== "resolved")
                      .length
                  }
                </span>
              )}
          </Link>
        ))}
        <Link className="ops-fan" href="/fan">
          Fan experience ↗
        </Link>
      </nav>
      <div className="ops-demo">
        <span>
          <strong>DEMO ENVIRONMENT</strong> Simulated sensors & dispatch · 1
          event minute = 2.5 seconds
        </span>
        <div>
          <span className="ops-mono">
            T+{String(state?.minute || 0).padStart(3, "0")} MIN
          </span>
          {role === "executive" && <button
            disabled={busy || !state}
            onClick={() =>
              send(
                { type: "pause" },
                state?.paused ? "Simulation resumed." : "Simulation paused.",
              )
            }
          >
            {state?.paused ? "▶ Resume" : "Ⅱ Pause"}
          </button>}
        </div>
      </div>
      {state?.emergency && (
        <div className="ops-emergency" role="alert">
          SIMULATED EMERGENCY ACTIVE — Verify exit availability and obtain staff
          approval before directing attendees.
        </div>
      )}
      <main id="ops-main" className="ops-main">
        {children}
      </main>
      <footer className="ops-footer">
        <strong>STADIA OPS</strong>
        <span>
          SHARED EVENT STATE / {state?.paused ? "PAUSED" : "SIMULATION ONLINE"}
        </span>
        <span>HACK CELESTIAL · PS–08</span>
        <span>HUMAN APPROVAL · EVERY RESPONSE</span>
      </footer>
      <Modal
        open={broadcast}
        onClose={() => setBroadcast(false)}
        title="Public address announcement"
      >
        <p>This records a simulated PA announcement in the shared event log.</p>
        <label className="ops-field">
          Announcement
          <textarea
            rows={4}
            maxLength={240}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
        <Button
          variant="primary"
          disabled={busy || message.trim().length < 5}
          onClick={async () => {
            if (
              await send(
                { type: "broadcast", message },
                "Simulated announcement added to the event log.",
              )
            )
              setBroadcast(false);
          }}
        >
          Confirm simulated broadcast
        </Button>
      </Modal>
    </>
  );
}
export default function Shell({ children }) {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("stadia_ops_theme_v2");
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {}
  }, []);
  const toggleTheme = () => setTheme((current) => {
    const next = current === "dark" ? "light" : "dark";
    try { window.localStorage.setItem("stadia_ops_theme_v2", next); } catch {}
    return next;
  });
  return (
    <div className="ops" data-theme={theme}>
      <OperationsProvider>
        <Frame theme={theme} onToggleTheme={toggleTheme}>{children}</Frame>
      </OperationsProvider>
    </div>
  );
}
