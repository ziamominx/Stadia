"use client";
import { useState } from "react";
import { useOperations } from "@/components/operations/OperationsProvider";
import {
  Badge,
  Button,
  Heading,
  Loading,
  Metrics,
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
            send({ type: "reserve" }, "Reserve coaches deployed to P4.")
          }
        >
          ↗ Deploy reserve coaches
        </Button>
      </Heading>
      <Metrics
        items={[
          {
            label: "Active coaches",
            value: 25 - standby,
            unit: "/ 25",
            detail: `${standby} on standby`,
          },
          {
            label: "Diverted vehicles",
            value: diverted,
            detail: "P3 → P4 relief corridor",
            tone: "normal",
          },
          {
            label: "P3 waiting",
            value: state.hubs[0].queue,
            unit: "pax",
            detail: `${Math.round((state.hubs[0].queue / state.hubs[0].capacity) * 100)}% staging occupancy`,
            tone: state.hubs[0].queue > 1100 ? "critical" : "",
          },
          {
            label: "Parking spaces",
            value: state.parking.reduce(
              (sum, p) => sum + p.capacity - p.used,
              0,
            ),
            detail: `Recommended: ${lots[0].name}`,
          },
        ]}
      />
      <div className="ops-workspace">
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
          <Panel title="Route change instructions" meta="EXECUTIVE DISPATCH">
            <TaskList team="transport" />
          </Panel>
          <Panel title="Transit hub readiness" meta="STAGING CAPACITY">
            <div className="ops-padded">
              {state.hubs.map((h) => (
                <div className="ops-hub-detail" key={h.id}>
                  <div className="ops-row">
                    <h3>
                      {h.id} / {h.name}
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
                </div>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
      <Panel
        title="Parking capacity & vehicle flow"
        meta={`LOWEST OCCUPANCY / ${lots[0].id}`}
      >
        <div className="ops-parking-grid">
          {state.parking.map((p) => (
            <div key={p.id}>
              <div className="ops-row">
                <h3>
                  {p.id} / {p.name}
                </h3>
                <Badge
                  tone={p.used / p.capacity > 0.85 ? "attention" : "normal"}
                >
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
