"use client";
import { useState } from "react";
import { useOperations } from "@/components/operations/OperationsProvider";
import {
  Badge,
  Button,
  Empty,
  Heading,
  Loading,
  Metrics,
  Panel,
  label,
  clock,
} from "@/components/operations/UI";
import {
  ReportDialog,
  Response,
} from "@/components/operations/IncidentResponse";
export default function Incidents() {
  const { state } = useOperations();
  const [selected, select] = useState(null),
    [filter, setFilter] = useState("all"),
    [report, setReport] = useState(false);
  if (!state) return <Loading />;
  const open = state.incidents.filter((i) => i.status !== "resolved"),
    closed = state.incidents.filter((i) => i.status === "resolved");
  const filtered = state.incidents.filter(
    (i) =>
      filter === "all" ||
      (filter === "resolved"
        ? i.status === "resolved"
        : i.status !== "resolved"),
  );
  const incident = filtered.find((i) => i.id === selected) || filtered[0],
    dispatched = state.incidents.filter((i) => i.dispatched !== undefined);
  return (
    <>
      <Heading
        title="Incidents"
        code="05 / COORDINATION"
        description="One incident record, every response team, a complete audit trail."
      >
        <Button variant="primary" onClick={() => setReport(true)}>
          ＋ Report manual incident
        </Button>
      </Heading>
      <Metrics
        items={[
          {
            label: "Active incidents",
            value: open.length,
            detail: "Awaiting response or verification",
            tone: open.length ? "critical" : "normal",
          },
          {
            label: "Responding",
            value: open.filter(
              (i) => i.status === "responding" || i.status === "stabilizing",
            ).length,
            detail: "Ground and transport coordination",
          },
          {
            label: "Avg dispatch time",
            value: dispatched.length
              ? (
                  dispatched.reduce((n, i) => n + i.dispatched - i.created, 0) /
                  dispatched.length
                ).toFixed(1)
              : "—",
            unit: "min",
            detail: "Simulated minutes from detection",
          },
          {
            label: "Resolved",
            value: closed.length,
            detail: "Completed and verified",
            tone: "normal",
          },
        ]}
      />
      <div className="ops-incidents-layout">
        <Panel
          title="Tactical incident log"
          meta={`${state.incidents.length} LOGGED`}
        >
          <div className="ops-table-controls">
            <div className="ops-segment">
              {["all", "active", "resolved"].map((f) => (
                <button
                  key={f}
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          {filtered.length ? (
            filtered.map((i) => (
              <button
                key={i.id}
                className={`ops-incident-item ${i.id === incident?.id ? "selected" : ""}`}
                onClick={() => select(i.id)}
              >
                <div className="ops-row">
                  <Badge tone={i.status === "resolved" ? "normal" : i.severity}>
                    {i.type}
                  </Badge>
                  <span className="ops-mono">{i.id}</span>
                </div>
                <h3>{i.title}</h3>
                <p>
                  {state.zones.find((z) => z.id === i.zoneId)?.sector} ·
                  Detected {clock(i.created)} IST
                </p>
                <div className="ops-row">
                  <span className="ops-mono">{label(i.status)}</span>
                  <span>Inspect →</span>
                </div>
              </button>
            ))
          ) : (
            <Empty title="No incidents in this view">
              Report a simulated incident or trigger an inflow spike from
              Command Center.
            </Empty>
          )}
        </Panel>
        <Panel
          title="Incident response workspace"
          meta={incident?.id || "NO SELECTION"}
        >
          <Response key={incident?.id} incident={incident} detailed />
        </Panel>
      </div>
      <ReportDialog open={report} onClose={() => setReport(false)} />
    </>
  );
}
