"use client";

import { useState } from "react";
import Link from "next/link";
import { useOperations } from "@/components/operations/OperationsProvider";
import { Badge, Heading, Loading, Panel, number } from "@/components/operations/UI";
import VenueMap from "@/components/operations/VenueMap";
import { gateStatus, waitMinutes } from "@/lib/operations/engine.mjs";

export default function StadiumPage() {
  const { state } = useOperations();
  const [selected, setSelected] = useState("west");
  if (!state) return <Loading />;
  const zone = state.zones.find((item) => item.id === selected) || state.zones[0];
  const wait = waitMinutes(zone.queue, zone.rate, zone.open);
  return <>
    <Heading title="Stadium Intelligence" code="02 / VENUE" description="A detailed DY Patil stadium schematic with gate density, crowd flow and exit readiness.">
      <Badge>Eight physical gates · four simulated sectors</Badge>
    </Heading>
    <div className="ops-map-page-summary">
      <div><span className="ops-kicker">Venue attendance</span><strong>{number(state.event.inside)}</strong><small>of {number(state.event.capacity)} capacity</small></div>
      <div><span className="ops-kicker">Gates open</span><strong>{state.zones.filter((item) => item.open).length * 2} / 8</strong><small>Two gates per sector</small></div>
      <div><span className="ops-kicker">Active incidents</span><strong>{state.incidents.filter((item) => item.status !== "resolved").length}</strong><small>Shared command state</small></div>
    </div>
    <div className="ops-dedicated-map"><VenueMap state={state} selected={selected} onSelect={setSelected} lockedView="schematic" /></div>
    <div className="ops-map-page-insights">
      <Panel title="Selected sector" meta="LIVE SIMULATION">
        <div className="ops-padded ops-map-page-sector">
          <div className="ops-row"><h3>{zone.name}</h3><Badge tone={gateStatus(zone, state.rules)}>{zone.occupancy}% occupied</Badge></div>
          <p>{number(zone.queue)} people waiting · {zone.rate} processed per minute · {wait ?? "—"} min estimated wait</p>
          <p className="ops-muted">{zone.open ? "Gate is open" : "Gate is held"}. Select another gate or sector on the schematic to inspect it.</p>
          <Link className="ops-text-link" href="/crowd">Open crowd intelligence ↗</Link>
        </div>
      </Panel>
      <Panel title="Sector comparison" meta="GATE PAIRS A–H">
        <div className="ops-map-page-sectors">{state.zones.map((item) => <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}><span>{item.name}</span><strong className={gateStatus(item, state.rules)}>{item.occupancy}%</strong></button>)}</div>
      </Panel>
    </div>
  </>;
}
