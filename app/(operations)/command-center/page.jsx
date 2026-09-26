"use client";
import { useState } from "react";
import Link from "next/link";
import { useOperations } from "@/components/operations/OperationsProvider";
import {
  Badge,
  Button,
  Heading,
  Loading,
  Metrics,
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
      <Metrics
        items={[
          {
            label: "Inside venue",
            value: number(state.event.inside),
            unit: `/ ${number(state.event.capacity)}`,
            detail: `${number(state.event.expected)} expected attendees`,
          },
          {
            label: "Overall occupancy",
            value: ((state.event.inside / state.event.capacity) * 100).toFixed(
              1,
            ),
            unit: "%",
            detail: `${number(state.event.exited)} attendees exited`,
            tone: "normal",
          },
          {
            label: "Active incidents",
            value: String(incidents.length).padStart(2, "0"),
            detail: incidents.length
              ? `${incidents.filter((i) => i.status === "detected").length} awaiting executive review`
              : "All sectors within configured limits",
            tone: incidents.length ? "critical" : "normal",
          },
          {
            label: "Response tasks",
            value: state.tasks.filter((t) => t.status !== "completed").length,
            unit: "open",
            detail: `${state.tasks.filter((t) => t.flagged).length} issues flagged by teams`,
          },
        ]}
      />
      <div className="ops-workspace">
        <div className="ops-map-column">
          <VenueMap state={state} selected={selected} onSelect={setSelected} />
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
          <Panel
            title="Priority situational protocol"
            meta={incident?.id || "ALL CLEAR"}
          >
            <Response incident={incident} />
          </Panel>
          <Panel title="Recent telemetry events" meta="SIM / IST">
            <div className="ops-log">
              {state.log.slice(0, 6).map((entry) => (
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
