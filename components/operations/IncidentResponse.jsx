"use client";
import { useState } from "react";
import Link from "next/link";
import { useOperations } from "./OperationsProvider";
import { Badge, Button, Empty, Modal, Progress, clock, label } from "./UI";

export function Response({ incident, detailed = false }) {
  const { state, send, busy } = useOperations();
  const [confirm, setConfirm] = useState(false);
  if (!incident)
    return (
      <Empty title="All sectors within limits">
        No active incident. Use the demo controls to introduce a crowd surge,
        fire alert, or medical report.
      </Empty>
    );
  const zone = state.zones.find((z) => z.id === incident.zoneId);
  const tasks = state.tasks.filter((t) => t.incidentId === incident.id);
  const fire = incident.type === "fire",
    medical = incident.type === "medical";
  const resource = fire
    ? "4 security staff"
    : medical
      ? "1 medical team"
      : "6 volunteer marshals";
  return (
    <div className="ops-response">
      {/* Status row */}
      <div className="ops-row">
        <Badge
          tone={incident.status === "resolved" ? "normal" : incident.severity}
        >
          {label(incident.status)}
        </Badge>
        <span className="ops-mono">
          {incident.id} / T+{state.minute - incident.created}m
        </span>
      </div>
      <h3>{incident.title}</h3>

      {/* WHAT IS HAPPENING */}
      <div className="ops-response-section">
        <span className="ops-kicker">What is happening</span>
        <div className="ops-diagnostic">
          <div>
            <span>Zone occupancy</span>
            <strong
              className={
                zone.occupancy >= state.rules.critical
                  ? "critical"
                  : zone.occupancy >= state.rules.warning
                    ? "attention"
                    : ""
              }
            >
              {zone.occupancy}%
            </strong>
          </div>
          <div>
            <span>{fire ? "Sensor" : medical ? "Report" : "Trend / min"}</span>
            <strong>
              {fire
                ? "SMOKE"
                : medical
                  ? "MANUAL"
                  : `${zone.trend > 0 ? "+" : ""}${zone.trend}%`}
            </strong>
          </div>
          <div>
            <span>Response</span>
            <strong>
              {incident.status === "resolved"
                ? "CLOSED"
                : incident.status === "detected"
                  ? "REVIEW"
                  : "ACTIVE"}
            </strong>
          </div>
        </div>
      </div>

      {/* WHY */}
      <div className="ops-response-section">
        <span className="ops-kicker">
          {fire
            ? "Simulated sensor report"
            : medical
              ? "Staff report"
              : "Why this is happening"}
        </span>
        <p>
          {fire
            ? `Smoke reported in ${zone.name}. Its nearby emergency exit is blocked in the simulation. Inspect the location and verify alternate exits before directing anyone.`
            : medical
              ? `Assistance requested at ${zone.name}. Dispatch an available medical team and track its arrival. Staff must confirm completion.`
              : zone.id === "west"
                ? "Incoming P3 shuttles exceed West Gate processing capacity. Divert arrivals to P4 and deploy volunteers to manage the queue."
                : `${zone.name} occupancy exceeded its configured critical threshold. Deploy volunteers and reduce incoming P3 arrivals while staff inspect the local crowd conditions.`}
        </p>
      </div>

      {incident.status === "detected" && (
        <>
          {/* IF NOTHING CHANGES */}
          <div className="ops-response-section">
            <span className="ops-kicker">If nothing changes</span>
            <div className="ops-prediction">
              {!fire && !medical ? (
                <>
                  <strong>
                    {zone.occupancy}% → peak ~
                    {Math.min(
                      zone.occupancy +
                        Math.max(
                          1,
                          Math.ceil(
                            (zone.occupancy - state.rules.warning + 1) / 5,
                          ),
                        ) *
                          5,
                      100,
                    )}
                    % in{" "}
                    {Math.max(
                      1,
                      Math.ceil(
                        (zone.occupancy - state.rules.warning + 1) / 5,
                      ),
                    )}{" "}
                    min
                  </strong>
                  <span>
                    Model estimate. Stabilises below {state.rules.warning}%
                    roughly{" "}
                    {Math.max(
                      1,
                      Math.ceil(
                        (zone.occupancy - state.rules.warning + 1) / 5,
                      ),
                    )}{" "}
                    simulated min after both teams start. Verify with live
                    readings.
                  </span>
                </>
              ) : (
                <span>
                  {fire
                    ? "Keep the affected exit blocked until staff clears the incident and explicitly reopens it."
                    : "Reserve an available team; no automated clinical assessment."}
                </span>
              )}
            </div>
          </div>

          {/* RECOMMENDED */}
          <div className="ops-recommendation">
            <span className="ops-kicker">
              Recommended response / executive approval
            </span>
            <p>
              <b>01</b> Deploy {resource} to {zone.name}.
            </p>
            {!fire && !medical && (
              <p>
                <b>02</b> Divert 3 incoming P3 buses to P4.
              </p>
            )}
          </div>

          <Button
            variant="primary full ops-btn-sheen"
            disabled={busy}
            onClick={() => setConfirm(true)}
          >
            Dispatch response ↗
          </Button>
        </>
      )}

      {/* Task status — badges only, not nav links (Executive shouldn't navigate away) */}
      {!!tasks.length && (
        <div className="ops-response-tasks">
          {tasks.map((t) => (
            <div className="ops-task-summary" key={t.id}>
              <span>{t.title}</span>
              <Badge tone={t.status === "completed" ? "normal" : "attention"}>
                {label(t.status)}
              </Badge>
              {t.flagged && <Badge tone="critical">Issue flagged</Badge>}
            </div>
          ))}
          {incident.type === "crowd" && incident.status !== "resolved" && (
            <div className="ops-stability">
              <span className="ops-kicker">
                Below-warning stability window · {incident.stable}/
                {state.rules.stableMinutes} min
              </span>
              <Progress
                value={(incident.stable / state.rules.stableMinutes) * 100}
              />
            </div>
          )}
        </div>
      )}

      {fire && incident.status !== "resolved" && (
        <div className="ops-note">
          {state.approvedRoutes?.filter((r) => r.incidentId === incident.id)
            .length ? (
            state.approvedRoutes
              .filter((r) => r.incidentId === incident.id)
              .map((r) => (
                <div key={r.exitId}>
                  <span className="ops-kicker">
                    Staff-approved alternate route / {r.exitId}
                  </span>
                  <p>{r.instructions}</p>
                </div>
              ))
          ) : (
            <>
              <p>No alternate route approved yet.</p>
              <Link href="/event-control" className="ops-text-link">
                Review exit status &amp; record verified route →
              </Link>
            </>
          )}
        </div>
      )}

      {incident.type !== "crowd" &&
        incident.status !== "resolved" &&
        tasks.length > 0 && (
          <Button
            variant="primary full"
            disabled={
              busy || tasks.some((t) => t.status !== "completed" || t.flagged)
            }
            onClick={() => setConfirm(true)}
          >
            Confirm staff clearance &amp; resolve
          </Button>
        )}

      {detailed && (
        <div className="ops-timeline">
          <h4>Incident audit trail</h4>
          {incident.timeline.map((entry, i) => (
            <div key={i}>
              <span>{clock(entry.minute)}</span>
              <p>{entry.text}</p>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title={
          incident.status === "detected"
            ? "Confirm response dispatch"
            : "Confirm incident clearance"
        }
      >
        <p>
          {incident.status === "detected"
            ? `Reserve ${resource} and send the response to the appropriate team dashboards.${incident.type === "crowd" ? " Three buses will also be assigned to the diversion task." : ""}`
            : "Confirm that the responding staff have cleared this incident. Blocked exits remain blocked until explicitly reopened in Event Control."}
        </p>
        <p className="ops-mono">SIMULATION ONLY · NO EXTERNAL DISPATCH</p>
        <div className="ops-actions">
          <Button onClick={() => setConfirm(false)}>Cancel</Button>
          <Button
            variant="primary"
            disabled={busy}
            onClick={async () => {
              if (
                await send(
                  {
                    type:
                      incident.status === "detected" ? "dispatch" : "resolve",
                    id: incident.id,
                  },
                  incident.status === "detected"
                    ? "Response dispatched to team dashboards."
                    : "Incident resolved after staff confirmation.",
                )
              )
                setConfirm(false);
            }}
          >
            {busy ? "Applying…" : "Confirm"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export function TaskList({ team }) {
  const { state, send, busy } = useOperations();
  const tasks = state.tasks.filter((t) => t.team === team);
  if (!tasks.length)
    return (
      <Empty title="No assigned tasks">
        Executive responses appear here after dispatch from Command Center or
        Incidents.
      </Empty>
    );
  return (
    <div className="ops-task-list">
      {tasks.map((t, idx) => (
        <article
          key={t.id}
          style={{ "--i": idx }}
          className={`ops-task-card ${t.flagged ? "flagged" : ""}`}
        >
          <div className="ops-row">
            <Badge tone={t.status === "completed" ? "normal" : "attention"}>
              {label(t.status)}
            </Badge>
            <span className="ops-mono">{t.incidentId}</span>
          </div>
          <h3>{t.title}</h3>
          <p>
            {state.zones.find((z) => z.id === t.zoneId)?.name} ·{" "}
            {t.team === "ground"
              ? `${t.quantity} ${t.resource} reserved`
              : `Buses ${t.busIds.join(", ")} · P3 → P4`}
          </p>
          <div className="ops-task-steps">
            {["pending", "accepted", "in_progress", "completed"].map((step) => (
              <span key={step} className={t.status === step ? "active" : ""}>
                {label(step)}
              </span>
            ))}
          </div>
          <div className="ops-actions">
            {t.status !== "completed" && (
              <>
                <Button
                  variant="primary"
                  disabled={busy || t.flagged}
                  onClick={() =>
                    send(
                      { type: "task", id: t.id },
                      "Task status updated across the event.",
                    )
                  }
                >
                  {t.status === "pending"
                    ? "Accept task"
                    : t.status === "accepted"
                      ? team === "transport"
                        ? "Start diversion"
                        : "Start deployment"
                      : "Mark complete"}{" "}
                  →
                </Button>
                <Button
                  variant={t.flagged ? "danger" : ""}
                  disabled={busy}
                  onClick={() =>
                    send(
                      { type: "flag", id: t.id },
                      t.flagged
                        ? "Issue cleared."
                        : "Issue flagged for executive review.",
                    )
                  }
                >
                  {t.flagged ? "Clear issue" : "Flag issue"}
                </Button>
              </>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export function ReportDialog({ open, onClose }) {
  const { state, send, busy } = useOperations();
  const [kind, setKind] = useState("medical"),
    [zoneId, setZone] = useState("west");
  return (
    <Modal open={open} onClose={onClose} title="Report a simulated incident">
      <p>
        The alert will appear on Command Center and Incidents. Teams receive
        tasks after executive approval.
      </p>
      <label className="ops-field">
        Incident type
        <select value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="medical">Medical assistance</option>
          <option value="fire">Smoke / fire alert</option>
        </select>
      </label>
      <label className="ops-field">
        Affected zone
        <select value={zoneId} onChange={(e) => setZone(e.target.value)}>
          {state.zones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name}
            </option>
          ))}
        </select>
      </label>
      <Button
        variant="primary full"
        disabled={busy}
        onClick={async () => {
          if (
            await send(
              { type: "report", kind, zoneId },
              "Incident reported. Executive review required.",
            )
          )
            onClose();
        }}
      >
        Create incident
      </Button>
    </Modal>
  );
}
