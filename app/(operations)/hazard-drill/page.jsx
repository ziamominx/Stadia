"use client";

import { useState } from "react";
import Link from "next/link";
import { useOperations } from "@/components/operations/OperationsProvider";
import { Badge, Button, Heading, Loading, Panel, number } from "@/components/operations/UI";
import VenueMap from "@/components/operations/VenueMap";
import EmergencyRoutes from "@/components/operations/EmergencyRoutes";
import { Response } from "@/components/operations/IncidentResponse";
import { gateStatus } from "@/lib/operations/engine.mjs";

export default function HazardDrillPage() {
  const { state, send, busy } = useOperations();
  const [selected, setSelected] = useState("east");
  const [paMessage, setPaMessage] = useState("Drill: avoid the affected East Gate. Follow marshals to a staff-verified alternate exit. Do not run.");
  if (!state) return <Loading />;

  const activeFire = state.incidents.find((incident) => incident.type === "fire" && incident.status !== "resolved");
  const affectedZone = state.zones.find((zone) => zone.id === (activeFire?.zoneId || selected));
  const blockedExit = state.exits.find((exit) => exit.zone === affectedZone.id);
  const drill = state.hazardDrill;
  const assignedTasks = activeFire ? state.tasks.filter((task) => task.incidentId === activeFire.id) : [];
  const approvals = activeFire ? state.approvedRoutes.filter((route) => route.incidentId === activeFire.id) : [];

  return <>
    <Heading
      title="Hazard Drill"
      code="04 / DAMAGE CONTROL"
      description="Launch one simulated smoke / fire alert and inspect the entire venue response in one workspace."
    >
      <label className="ops-hazard-zone">Affected sector
        <select value={selected} onChange={(event) => setSelected(event.target.value)} disabled={busy || !!activeFire}>
          {state.zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
        </select>
      </label>
      <Button variant="danger" disabled={busy || !!activeFire} onClick={() => send({ type: "hazard_drill", zoneId: selected }, "Simulated fire drill launched. Review blocked exits and dispatch teams.")}>
        {activeFire ? "● Fire response active" : "▷ Launch fire drill"}
      </Button>
    </Heading>

    <div className="ops-hazard-disclosure" role="note">
      <strong>SIMULATION ONLY</strong> Camera checkpoints, sensor signals, heat indicators, radio confirmations and PA entries below are simulated. No live CCTV or radio hardware is connected.
    </div>

    <div className="ops-hazard-status" aria-live="polite">
      <div><span className="ops-kicker">Hazard state</span><strong className={activeFire ? "critical" : ""}>{activeFire ? "FIRE ALERT" : "STANDBY"}</strong><small>{activeFire ? affectedZone.name : "Choose a sector and launch"}</small></div>
      <div><span className="ops-kicker">Affected gate</span><strong>{affectedZone.open ? "OPEN" : "HELD"}</strong><small>Processing {affectedZone.open ? "active" : "stopped"}</small></div>
      <div><span className="ops-kicker">Nearby exit</span><strong className={blockedExit.status === "blocked" ? "critical" : ""}>{blockedExit.status.toUpperCase()}</strong><small>{blockedExit.name}</small></div>
      <div><span className="ops-kicker">Field response</span><strong>{assignedTasks.length ? `${assignedTasks.filter((task) => task.status === "completed").length}/${assignedTasks.length}` : "—"}</strong><small>{assignedTasks.length ? "tasks complete" : "Awaiting dispatch"}</small></div>
      <div><span className="ops-kicker">Alternate route</span><strong>{approvals.length ? "APPROVED" : "PENDING"}</strong><small>Staff verification required</small></div>
    </div>

    <div className="ops-hazard-layout">
      <div className="ops-hazard-main">
        <VenueMap state={state} selected={activeFire?.zoneId || selected} onSelect={setSelected} lockedView="schematic" />
        <Panel title="Camera checkpoints & crowd heat" meta="SIMULATED OBSERVATIONS">
          <div className="ops-hazard-cameras">
            {state.zones.map((zone, index) => <button key={zone.id} type="button" aria-pressed={selected === zone.id} onClick={() => setSelected(zone.id)}>
              <span className="ops-hazard-camera-id">CAM {String(index + 1).padStart(2, "0")} / {zone.sector}</span>
              <span className="ops-hazard-camera-name">{zone.name}</span>
              <strong className={zone.fire ? "critical" : gateStatus(zone, state.rules)}>{zone.fire ? "SMOKE FLAG" : `${zone.occupancy}% DENSITY`}</strong>
              <span className="ops-hazard-heat"><span style={{ width: `${zone.occupancy}%` }} /></span>
              <small>{number(zone.queue)} waiting · {zone.open ? "gate open" : "gate held"}</small>
            </button>)}
          </div>
        </Panel>
        <EmergencyRoutes />
      </div>

      <aside className="ops-hazard-rail">
        <Panel title="Incident response" meta={activeFire?.id || "AWAITING DRILL"}>
          <Response key={activeFire?.id || "none"} incident={activeFire} detailed />
        </Panel>
        <Panel title="Offline field coordination" meta="MANUAL RADIO / PA LOG">
          <div className="ops-hazard-comms">
            <p>Use verbal radio calls and the public address system. Record each confirmation here so every team sees the same drill status.</p>
            {[["security", "Security lead at affected gate"], ["ground", "Ground marshals at alternate route"]].map(([channel, title]) => <div className="ops-hazard-comms-row" key={channel}>
              <div><strong>{title}</strong><small>{drill?.radioAcks?.[channel] ? "Verbal confirmation recorded" : "Awaiting verbal confirmation"}</small></div>
              <Button disabled={busy || !activeFire || !drill || drill.radioAcks[channel]} onClick={() => send({ type: "radio_ack", channel }, `${title} confirmation recorded.`)}>{drill?.radioAcks?.[channel] ? "✓ Logged" : "Log radio check"}</Button>
            </div>)}
            <label className="ops-field">PA announcement script
              <textarea rows={3} maxLength={240} value={paMessage} onChange={(event) => setPaMessage(event.target.value)} />
            </label>
            <Button variant="primary" disabled={busy || !activeFire || paMessage.trim().length < 5} onClick={() => send({ type: "broadcast", message: paMessage }, "Simulated PA announcement recorded in the shared log.")}>Log simulated PA announcement</Button>
            {drill?.radioAcks?.pa && <Badge tone="normal">PA script logged</Badge>}
            <p className="ops-muted">These controls record operator reports. They do not transmit over radio or venue speakers.</p>
          </div>
        </Panel>
        <Panel title="Workforce readiness" meta="SHARED ROSTER">
          <div className="ops-hazard-roster">{state.personnel.map((person) => <div key={person.id}><span>{person.name}</span><strong>{person.total - person.deployed} available</strong></div>)}</div>
          <div className="ops-padded"><Link href="/ground" className="ops-text-link">Inspect field tasks ↗</Link></div>
        </Panel>
      </aside>
    </div>
  </>;
}
