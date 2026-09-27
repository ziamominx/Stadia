"use client";
import { useState } from "react";
import EmergencyRoutes from "@/components/operations/EmergencyRoutes";
import ResourceControl from "@/components/operations/ResourceControl";
import { useOperations } from "@/components/operations/OperationsProvider";
import {
  Badge,
  Button,
  Heading,
  Loading,
  Metrics,
  Modal,
  Panel,
  Progress,
} from "@/components/operations/UI";
function Configuration({ state, send, busy }) {
  const [form, setForm] = useState({
    name: state.event.name,
    capacity: state.event.capacity,
    warning: state.rules.warning,
    critical: state.rules.critical,
  });
  const [confirm, setConfirm] = useState("");
  const change = (key, value) =>
    setForm((previous) => ({ ...previous, [key]: value }));
  const exportState = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob),
      link = document.createElement("a");
    link.href = url;
    link.download = "stadia-event-snapshot.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <>
      <Heading
        title="Event Control"
        code="06 / CONFIGURATION"
        description="Event parameters, crowd rules, resource readiness, and emergency controls."
      >
        <Button onClick={exportState}>↓ Export event snapshot</Button>
        <Button
          variant="primary"
          disabled={busy}
          onClick={() => setConfirm("settings")}
        >
          Commit parameters ↗
        </Button>
      </Heading>
      <Metrics
        items={[
          {
            label: "Event runtime",
            value: state.paused ? "Paused" : "Live",
            detail: `T+${state.minute} simulated minutes`,
          },
          {
            label: "Venue capacity",
            value: state.event.capacity.toLocaleString(),
            unit: "pax",
            detail: `${state.event.inside.toLocaleString()} inside`,
          },
          {
            label: "Available exits",
            value: state.exits.filter((e) => e.status === "available").length,
            unit: "/ 4",
            detail: "Staff-maintained exit status",
            tone: "normal",
          },
          {
            label: "Fleet pool",
            value: state.buses.length,
            unit: "coaches",
            detail: "Shared with Transport Operations",
          },
        ]}
      />
      <div className="ops-config-notice">
        <Badge>Live configuration</Badge>
        <p>
          Saved thresholds are applied to all screens and immediately
          re-evaluate crowd alerts. All external sensors and dispatches are
          simulated.
        </p>
      </div>
      <div className="ops-config-grid">
        <Panel title="01 / Event identity & capacity" meta="VENUE ENVELOPE">
          <div className="ops-padded">
            <label className="ops-field">
              Event title
              <input
                value={form.name}
                maxLength={100}
                onChange={(e) => change("name", e.target.value)}
              />
            </label>
            <label className="ops-field">
              Maximum venue capacity
              <input
                type="number"
                min={state.event.inside}
                max={150000}
                step={1}
                value={form.capacity}
                onChange={(e) => change("capacity", e.target.value)}
              />
            </label>
            <div className="ops-row">
              <span className="ops-kicker">Current venue occupancy</span>
              <strong>
                {((state.event.inside / state.event.capacity) * 100).toFixed(1)}
                %
              </strong>
            </div>
            <Progress
              value={(state.event.inside / state.event.capacity) * 100}
            />
            <p className="ops-muted">
              Capacity cannot be set below the current number of attendees
              inside.
            </p>
          </div>
        </Panel>
        <Panel title="02 / Crowd rules & thresholds" meta="ALL MONITORED ZONES">
          <div className="ops-padded">
            <label className="ops-field">
              Warning threshold <span>{form.warning}%</span>
              <input
                type="range"
                min={50}
                max={95}
                value={form.warning}
                onChange={(e) => change("warning", Number(e.target.value))}
              />
            </label>
            <label className="ops-field">
              Critical threshold <span>{form.critical}%</span>
              <input
                type="range"
                min={55}
                max={99}
                value={form.critical}
                onChange={(e) => change("critical", Number(e.target.value))}
              />
            </label>
            <p>
              Warning must be lower than critical. Crowd incidents resolve after
              occupancy stays below warning for{" "}
              <strong>{state.rules.stableMinutes} simulated minutes</strong>{" "}
              with both response teams active.
            </p>
            <Badge tone="attention">Changes require commit</Badge>
          </div>
        </Panel>
        <Panel
          title="03 / Emergency exit topology"
          meta="STAFF-VERIFIED STATUS"
        >
          <div className="ops-padded">
            {state.exits.map((e) => (
              <div className="ops-exit-row" key={e.id}>
                <div>
                  <strong>{e.name}</strong>
                  <span className="ops-mono">
                    {e.id} / {e.zone.toUpperCase()}
                  </span>
                </div>
                <select
                  aria-label={`${e.name} status`}
                  value={e.status}
                  disabled={busy}
                  onChange={(ev) =>
                    send(
                      { type: "exit", id: e.id, status: ev.target.value },
                      "Exit status updated across the venue.",
                    )
                  }
                >
                  <option value="available">Available</option>
                  <option value="blocked">Blocked</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            ))}
            <p className="ops-muted">
              Fire reports block the affected exit. Clear the incident before
              explicitly reopening it.
            </p>
          </div>
        </Panel>
        <Panel
          title="04 / Ground resource readiness"
          meta="RESERVATION CONTROL"
        >
          <div className="ops-padded">
            <ResourceControl />
            <p className="ops-muted">
              Dispatch reserves personnel immediately. Verified incident
              resolution returns the response team to the available pool.
            </p>
          </div>
        </Panel>
        <Panel title="05 / Weather & shelter simulation" meta="DEMO DATA">
          <div className="ops-padded">
            <div className="ops-row">
              <h3>
                {state.weather.rain
                  ? "Rain / waterlogging reported"
                  : "Normal weather conditions"}
              </h3>
              <Badge tone={state.weather.rain ? "attention" : "normal"}>
                {state.weather.rain ? "Rain" : "Clear"}
              </Badge>
            </div>
            <p>
              {state.weather.sheltered} / {state.weather.shelterCapacity}{" "}
              shelter spaces occupied.
            </p>
            <Progress
              value={
                (state.weather.sheltered / state.weather.shelterCapacity) * 100
              }
            />
            <p>
              {state.weather.waterlogged
                ? "South walkway flagged for staff inspection."
                : "No waterlogged walkways reported."}
            </p>
            <Button disabled={busy} onClick={() => send({ type: "rain" })}>
              {state.weather.rain
                ? "Clear weather simulation"
                : "Simulate rain & waterlogging"}
            </Button>
          </div>
        </Panel>
        <Panel title="06 / Demo session" meta="PRESENTER CONTROLS">
          <div className="ops-padded">
            <h3>A repeatable final-round demo</h3>
            <p>
              Reset returns all counts, incidents, resources, and tasks to the
              seeded baseline. This affects every browser connected to this
              server.
            </p>
            <div className="ops-actions">
              <Button
                disabled={busy}
                onClick={() =>
                  send(
                    { type: "pause" },
                    state.paused ? "Simulation resumed." : "Simulation paused.",
                  )
                }
              >
                {state.paused ? "Resume simulation" : "Pause simulation"}
              </Button>
              <Button variant="danger" onClick={() => setConfirm("reset")}>
                Reset demo session
              </Button>
            </div>
            <p className="ops-muted">
              State is held in server memory and resets on server restart.
              Operations accounts are role protected; telemetry remains simulated.
            </p>
          </div>
        </Panel>
      </div>
      <EmergencyRoutes />
      <section className="ops-emergency-panel">
        <div>
          <span className="ops-kicker">07 / Emergency protocols</span>
          <h2>Stadium emergency override</h2>
          <p>
            Record a simulated emergency posture across all dashboards.
            Available exits are staff-maintained; the demo does not contact
            emergency services or operate real stadium hardware.
          </p>
        </div>
        <Button
          variant="danger"
          disabled={busy}
          onClick={() => setConfirm("emergency")}
        >
          {state.emergency
            ? "End simulated emergency"
            : "Activate simulated emergency"}
        </Button>
      </section>
      <Modal
        open={!!confirm}
        onClose={() => setConfirm("")}
        title={
          confirm === "settings"
            ? "Commit event parameters"
            : confirm === "reset"
              ? "Reset the shared demo session"
              : "Confirm emergency posture change"
        }
      >
        <p>
          {confirm === "settings"
            ? `Apply warning ${form.warning}%, critical ${form.critical}%, and venue capacity ${form.capacity} to the shared event?`
            : confirm === "reset"
              ? "This clears this demo session’s incidents, tasks, and analytics for all connected browsers."
              : "This changes the simulated event posture. It does not issue real evacuation directions or contact external services."}
        </p>
        <div className="ops-actions">
          <Button onClick={() => setConfirm("")}>Cancel</Button>
          <Button
            variant={confirm === "settings" ? "primary" : "danger"}
            disabled={busy}
            onClick={async () => {
              if (
                await send(
                  confirm === "settings"
                    ? { type: "settings", ...form }
                    : { type: confirm },
                  confirm === "reset"
                    ? "Demo reset to baseline."
                    : "Event controls updated.",
                )
              )
                setConfirm("");
            }}
          >
            Confirm {confirm === "reset" ? "reset" : "change"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
export default function EventControl() {
  const { state, send, busy } = useOperations();
  if (!state) return <Loading />;
  return (
    <Configuration
      key={`${state.event.name}-${state.event.capacity}-${state.rules.warning}-${state.rules.critical}`}
      state={state}
      send={send}
      busy={busy}
    />
  );
}
