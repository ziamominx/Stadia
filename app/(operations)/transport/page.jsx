"use client";
import { useState } from "react";
import { useOperations } from "@/components/operations/OperationsProvider";
import {
  Badge,
  Button,
  Heading,
  Loading,
  Panel,
  Progress,
  label,
} from "@/components/operations/UI";
import VenueMap from "@/components/operations/VenueMap";
import { TaskList } from "@/components/operations/IncidentResponse";

export default function Transport() {
  const { state, send, busy } = useOperations();
  const [selected, select] = useState("west"),
    [filter, setFilter] = useState("all");
  if (!state) return <Loading />;
  const standby = state.buses.filter((b) => b.status === "standby").length,
    diverted = state.buses.filter((b) => b.status === "diverted").length;
  const lots = [...state.parking].sort(
    (a, b) => a.used / a.capacity - b.used / b.capacity,
  );

  return (
    <>
      <Heading
        title="Transport Operations"
        code="04 / MOBILITY"
        description="Fleet coordination, transit hub pressure, and parking capacity."
      >
        <Button
          variant="primary"
          disabled={busy || !standby}
          onClick={() =>
            send({ type: "reserve" }, "Reserve coaches deployed.")
          }
        >
          {state.ml?.shuttle
            ? `↗ Deploy to ${state.ml.shuttle.hub} (ML — ${state.ml.shuttle.confidence}% conf.)`
            : "↗ Deploy reserve coaches"}
        </Button>
      </Heading>

      {/* TASK HERO — dispatch action above the fold */}
      <div className="ops-task-hero">
        <Panel
          title="Route change instructions"
          meta="EXECUTIVE DISPATCH"
        >
          <TaskList team="transport" />
        </Panel>
      </div>

      {/* Secondary — fleet, hubs, map */}
      <div className="ops-secondary-details">
        <div className="ops-map-column">
          <VenueMap
            state={state}
            selected={selected}
            onSelect={select}
            mode="transport"
          />
          <Panel title="Fleet inventory" meta="SIMULATED POSITIONS">
            <div className="ops-table-controls">
              <div className="ops-segment">
                {["all", "active", "diverted", "standby"].map((f) => (
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
            <div className="ops-table-wrap">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Assigned approach</th>
                    <th>Passenger load</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {state.buses
                    .filter((b) => filter === "all" || b.status === filter)
                    .map((b) => (
                      <tr key={b.id}>
                        <td>
                          <strong>BUS {String(b.id).padStart(2, "0")}</strong>
                        </td>
                        <td>
                          {b.hub} → {b.hub === "P3" ? "West Gate" : "East Gate"}
                        </td>
                        <td>
                          {b.load} / {b.capacity}
                        </td>
                        <td>
                          <Badge
                            tone={
                              b.status === "assigned" ? "attention" : "normal"
                            }
                          >
                            {label(b.status)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {!state.buses.some(
                (b) => filter === "all" || b.status === filter,
              ) && <p className="ops-padded">No vehicles match this filter.</p>}
            </div>
          </Panel>
        </div>

        <aside className="ops-rail">
          <Panel title="Transit hub readiness" meta="STAGING CAPACITY">
            <div className="ops-padded">
              {state.hubs.map((h) => (
                <div className="ops-hub-detail" key={h.id}>
                  <div className="ops-row">
                    <h3>
                      {h.id} / {h.name}
                      {state.ml?.shuttle?.hub === h.id && (
                        <span className="ops-ml-chip" style={{ marginLeft: 8 }}>ML pick</span>
                      )}
                    </h3>
                    <Badge
                      tone={
                        h.queue / h.capacity > 0.75 ? "attention" : "normal"
                      }
                    >
                      {Math.round((h.queue / h.capacity) * 100)}% full
                    </Badge>
                  </div>
                  <p>
                    {h.queue} waiting · {h.capacity - h.queue} spaces available
                  </p>
                  <Progress
                    value={(h.queue / h.capacity) * 100}
                    tone={h.queue / h.capacity > 0.75 ? "attention" : ""}
                  />
                  {state.ml?.shuttle?.hub === h.id && state.ml.shuttle.reason && (
                    <p className="ops-ml-reason">{state.ml.shuttle.reason}</p>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Fleet summary" meta="LIVE">
            <div className="ops-padded">
              <div className="ops-row">
                <span className="ops-kicker">Active coaches</span>
                <strong>{state.buses.length - standby} / {state.buses.length}</strong>
              </div>
              <div className="ops-row" style={{ marginTop: 10 }}>
                <span className="ops-kicker">Diverted · P3 → P4</span>
                <strong className="normal">{diverted}</strong>
              </div>
              <div className="ops-row" style={{ marginTop: 10 }}>
                <span className="ops-kicker">ML recommended hub</span>
                <strong className="ops-ml-value">{state.ml?.shuttle?.hub ?? lots[0].name}</strong>
              </div>
            </div>
          </Panel>
        </aside>
      </div>

      <Panel
        title="Parking capacity &amp; vehicle flow"
        meta={`LOWEST OCCUPANCY / ${lots[0].id}`}
      >
        <div className="ops-parking-grid">
          {state.parking.map((p) => (
            <div key={p.id}>
              <div className="ops-row">
                <h3>
                  {p.id} / {p.name}
                </h3>
                <Badge tone={p.used / p.capacity > 0.85 ? "attention" : "normal"}>
                  {Math.round((p.used / p.capacity) * 100)}%
                </Badge>
              </div>
              <strong className="ops-parking-count">
                {p.capacity - p.used}
                <small> spaces free</small>
              </strong>
              <Progress
                value={(p.used / p.capacity) * 100}
                tone={p.used / p.capacity > 0.85 ? "attention" : ""}
              />
              <p className="ops-mono">
                {p.used} / {p.capacity} occupied
              </p>
              <div className="ops-actions">
                <Button
                  disabled={busy || p.used + 10 > p.capacity}
                  onClick={() =>
                    send(
                      { type: "parking", id: p.id, delta: 10 },
                      "10 simulated vehicle arrivals recorded.",
                    )
                  }
                >
                  ＋ 10 arrive
                </Button>
                <Button
                  disabled={busy || p.used < 10}
                  onClick={() =>
                    send(
                      { type: "parking", id: p.id, delta: -10 },
                      "10 simulated vehicle departures recorded.",
                    )
                  }
                >
                  − 10 depart
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
