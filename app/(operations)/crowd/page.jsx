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
  Sparkline,
  number,
} from "@/components/operations/UI";
import VenueMap from "@/components/operations/VenueMap";
import { gateStatus, waitMinutes } from "@/lib/operations/engine.mjs";
export default function Crowd() {
  const { state, send, busy } = useOperations();
  const [selected, select] = useState("west");
  if (!state) return <Loading />;
  const zone = state.zones.find((z) => z.id === selected),
    wait = waitMinutes(zone.queue, zone.rate, zone.open);
  return (
    <>
      <Heading
        title="Crowd Intelligence"
        code="02 / FLOW"
        description="Concourse occupancy, queue pressure, and gate processing capacity."
      >
        <Badge tone={state.posture}>{state.posture} posture</Badge>
      </Heading>
      <Metrics
        items={[
          {
            label: "Inside venue",
            value: number(state.event.inside),
            unit: "pax",
            detail: `${number(state.event.capacity - state.event.inside)} venue headroom`,
          },
          {
            label: "Entries recorded",
            value: number(state.event.entered),
            detail: "Cumulative gate entry count",
          },
          {
            label: "Exits recorded",
            value: number(state.event.exited),
            detail: "Cumulative gate exit count",
          },
          {
            label: "Selected gate wait",
            value: wait ?? "—",
            unit: "min",
            detail: zone.open
              ? `${number(zone.queue)} waiting at ${zone.name}`
              : "Gate held · processing stopped",
            tone: wait > 8 ? "attention" : "normal",
          },
        ]}
      />
      <div className="ops-workspace">
        <div className="ops-map-column">
          <VenueMap state={state} selected={selected} onSelect={select} />
          <Panel title="Actionable crowd outlook" meta="RULE-BASED SIMULATION">
            <div className="ops-outlook">
              {state.zones.map((z) => (
                <button
                  onClick={() => select(z.id)}
                  key={z.id}
                  className={selected === z.id ? "selected" : ""}
                >
                  <Badge tone={gateStatus(z, state.rules)}>
                    {gateStatus(z, state.rules)}
                  </Badge>
                  <h3>{z.name}</h3>
                  <strong>{z.occupancy}%</strong>
                  <p>
                    {z.ml?.predictedBreach != null
                      ? `ML predicts threshold breach in ~${z.ml.predictedBreach} sim min.`
                      : z.occupancy >= state.rules.critical
                        ? "Already critical. Executive response required."
                        : z.trend > 0
                          ? `Trending up. Monitor for escalation.`
                          : "Stable trend. No approaching threshold."}
                  </p>
                  {z.ml && z.ml.surgeRisk >= 40 && (
                    <span className="ops-ml-chip">{z.ml.surgeRisk}% surge risk</span>
                  )}
                </button>
              ))}
            </div>
          </Panel>
        </div>
        <aside className="ops-rail">
          <Panel title={`${zone.name} / flow control`} meta={zone.sector}>
            <div className="ops-padded">
              <div className="ops-row">
                <Badge tone={gateStatus(zone, state.rules)}>
                  {zone.occupancy}% occupancy
                </Badge>
                <span className="ops-mono">
                  {zone.open ? "GATE OPEN" : "GATE HELD"}
                </span>
              </div>
              <Sparkline
                values={zone.history}
                tone={gateStatus(zone, state.rules)}
                large
              />
              <div className="ops-row">
                <span className="ops-kicker">
                  Last {zone.history.length} readings
                </span>
                <span className="ops-mono">
                  {zone.trend > 0 ? "+" : ""}
                  {zone.trend}% / SIM MIN
                </span>
              </div>
              <hr />
              <p>
                Queue: <strong>{number(zone.queue)} people</strong>
                <br />
                Processing:{" "}
                <strong>{zone.open ? zone.rate : 0} people / min</strong>
                <br />
                Estimated wait:{" "}
                <strong>
                  {wait === null
                    ? "Unavailable while gate is held"
                    : `${wait} minutes`}
                </strong>
              </p>
              <p className="ops-muted">
                Wait estimate = queue ÷ processing rate. New arrivals can change
                the actual wait.
              </p>
              <Button
                variant={zone.open ? "" : "primary"}
                disabled={busy}
                className={zone.ml?.surgeRisk >= 60 && zone.open ? "ops-ml-urgent" : ""}
                onClick={() => send({ type: "gate", zoneId: zone.id })}
              >
                {zone.open
                  ? zone.ml?.surgeRisk >= 60
                    ? `Hold gate — ML risk ${zone.ml.surgeRisk}%`
                    : "Hold gate processing"
                  : "Open gate processing"}
              </Button>
              <hr />
              <span className="ops-kicker">Virtual ticket scanner</span>
              <div className="ops-actions">
                <Button
                  disabled={busy || !zone.open || zone.fire}
                  onClick={() =>
                    send(
                      { type: "entry", zoneId: zone.id, count: 25 },
                      "25 simulated entries recorded.",
                    )
                  }
                >
                  ＋ 25 entries
                </Button>
                <Button
                  disabled={busy || !zone.open || zone.fire}
                  onClick={() =>
                    send(
                      { type: "entry", zoneId: zone.id, count: -25 },
                      "25 simulated exits recorded.",
                    )
                  }
                >
                  − 25 exits
                </Button>
              </div>
            </div>
          </Panel>
          <Panel title="Alternative entry gates" meta="SORTED BY ML RISK">
            <div className="ops-padded">
              {state.zones
                .filter(
                  (z) =>
                    z.id !== zone.id &&
                    z.open &&
                    !z.fire &&
                    z.occupancy < state.rules.warning,
                )
                .sort((a, b) => (a.ml?.surgeRisk ?? 50) - (b.ml?.surgeRisk ?? 50))
                .map((z) => (
                  <button
                    className="ops-list-button"
                    key={z.id}
                    onClick={() => select(z.id)}
                  >
                    <span>
                      {z.name}
                      <small>{z.occupancy}% · {z.ml ? `${z.ml.surgeRisk}% risk` : `${waitMinutes(z.queue, z.rate)} min wait`}</small>
                    </span>
                    <strong>{waitMinutes(z.queue, z.rate)} min ↗</strong>
                  </button>
                ))}
              <p className="ops-muted">
                Gates sorted by ML surge risk, lowest first. Staff must verify
                ticket access before redirecting attendees.
              </p>
            </div>
          </Panel>
        </aside>
      </div>
      <Panel title="Facility queue monitoring" meta="FOOD COURTS / RESTROOMS">
        <div className="ops-facilities">
          {state.facilities.map((f) => (
            <div key={f.id}>
              <div>
                <Badge tone={f.queue > 50 ? "attention" : "normal"}>
                  {f.queue > 50 ? "Long queue" : "Normal"}
                </Badge>
                <h3>{f.name}</h3>
                <p>
                  {f.queue} waiting · ~{Math.ceil(f.queue / f.rate)} min wait
                </p>
              </div>
              <Button
                disabled={busy}
                onClick={() => send({ type: "facility", id: f.id })}
              >
                {f.queue > 50
                  ? "Clear queue simulation"
                  : "Simulate queue surge"}
              </Button>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
