"use client";
import { useState } from "react";
import Link from "next/link";
import { useOperations } from "@/components/operations/OperationsProvider";
import {
  Badge,
  Button,
  Heading,
  Loading,
  Panel,
  Sparkline,
  clock,
  number,
} from "@/components/operations/UI";
import VenueMap from "@/components/operations/VenueMap";
import {
  ReportDialog,
  Response,
} from "@/components/operations/IncidentResponse";
import { gateStatus, waitMinutes } from "@/lib/operations/engine.mjs";

export default function CommandCenter() {
  const { state, send, busy } = useOperations();
  const [selected, setSelected] = useState("west"),
    [report, setReport] = useState(false);
  if (!state) return <Loading />;
  const zone = state.zones.find((z) => z.id === selected),
    incidents = state.incidents.filter((i) => i.status !== "resolved");
  const incident = incidents.find((i) => i.zoneId === selected) || incidents[0];
  const occupancy = ((state.event.inside / state.event.capacity) * 100).toFixed(1);

  return (
    <>
      <Heading
        title="Command Center"
        code="01 / LIVE"
        description="One venue. Every team. A shared operational picture."
      >
        <Button onClick={() => setReport(true)}>＋ Report incident</Button>
        <Button
          variant="primary"
          disabled={busy || state.spike}
          onClick={() =>
            send(
              { type: "spike" },
              "P3 surge started. Watch West Gate turn critical.",
            )
          }
        >
          {state.spike ? "● Inflow spike active" : "▷ Simulate inflow spike"}
        </Button>
      </Heading>

      {/* Compact stat bar — replaces heavy 4-card Metrics row */}
      <div className="ops-stat-bar">
        <div className="ops-stat-bar-item">
          <strong>{number(state.event.inside)}</strong>
          <small>inside · {number(state.event.capacity)} cap</small>
        </div>
        <div className="ops-stat-bar-item">
          <strong className={occupancy >= state.rules.critical ? "critical" : occupancy >= state.rules.warning ? "attention" : ""}>
            {occupancy}%
          </strong>
          <small>overall occupancy</small>
        </div>
        <div className="ops-stat-bar-item">
          <strong className={incidents.length ? "critical" : ""}>{String(incidents.length).padStart(2, "0")}</strong>
          <small>{incidents.length ? `${incidents.filter(i => i.status === "detected").length} awaiting review` : "all sectors clear"}</small>
        </div>
        <div className="ops-stat-bar-item">
          <strong>{state.tasks.filter((t) => t.status !== "completed").length}</strong>
          <small>{state.tasks.filter((t) => t.flagged).length} tasks flagged</small>
        </div>
      </div>

      {/* MAP HERO — full width, situation card floats inside */}
      <div className="ops-map-hero">
        <VenueMap state={state} selected={selected} onSelect={setSelected} />
        {incident && (
          <div className="ops-situation-overlay">
            <div className="ops-situation-overlay-header">
              <span>Priority situation</span>
              <span className="ops-mono">{incident.id}</span>
            </div>
            <Response incident={incident} />
          </div>
        )}
      </div>

      {/* Zone inspector + sector strip below the map */}
      <div className="ops-workspace">
        <div className="ops-map-column">
          <div className="ops-inspector">
            <div>
              <span className="ops-kicker">
                Selected sector / {zone.sector}
              </span>
              <h2>{zone.name}</h2>
              <Badge tone={gateStatus(zone, state.rules)}>
                {zone.occupancy}% zone occupancy
              </Badge>
            </div>
            <div>
              <span className="ops-kicker">Queue / processing</span>
              <strong>
                {number(zone.queue)} <small>waiting</small>
              </strong>
              <span className="ops-mono">
                {zone.rate} people / min ·{" "}
                {waitMinutes(zone.queue, zone.rate, zone.open) ?? "—"} min wait
              </span>
            </div>
            <Sparkline
              values={zone.history}
              tone={gateStatus(zone, state.rules)}
            />
            <Link className="ops-text-link" href="/crowd">
              Inspect crowd intelligence ↗
            </Link>
          </div>

          <Panel title="Sector readiness" meta="LIVE / SHARED STATE">
            <div className="ops-zone-strip">
              {state.zones.map((z) => (
                <button
                  onClick={() => setSelected(z.id)}
                  key={z.id}
                  className={selected === z.id ? "selected" : ""}
                >
                  <span className="ops-kicker">{z.name}</span>
                  <strong className={gateStatus(z, state.rules)}>
                    {z.occupancy}%
                  </strong>
                  <span className="ops-mono">
                    {z.fire ? "FIRE ALERT" : z.open ? "GATE OPEN" : "GATE HELD"}
                  </span>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <aside className="ops-rail">
          <Panel title="Recent telemetry events" meta="SIM / IST">
            <div className="ops-log" aria-live="polite" aria-atomic="false">
              {state.log.slice(0, 8).map((entry) => (
                <div key={entry.id}>
                  <span className={`ops-log-dot ${entry.type}`}>●</span>
                  <p>{entry.text}</p>
                  <time>{clock(entry.minute)}</time>
                </div>
              ))}
            </div>
          </Panel>
          {state.weather.rain && (
            <div className="ops-weather">
              <Badge tone="attention">Rain scenario active</Badge>
              <p>
                South walkway waterlogging reported.{" "}
                {state.weather.shelterCapacity - state.weather.sheltered}{" "}
                shelter spaces available.
              </p>
            </div>
          )}
        </aside>
      </div>

      <ReportDialog open={report} onClose={() => setReport(false)} />
    </>
  );
}
