"use client";

import { useState } from "react";
import { gateStatus } from "@/lib/operations/engine.mjs";
import { DY_PATIL, STADIUM_GATES, isDyPatilVenue } from "@/lib/operations/dy-patil.mjs";
import { Badge } from "./UI";
import GeoVenueMap from "./GeoVenueMap";

const VIEW_OPTIONS = ["schematic", "street"];
const SCHEMATIC_LAYERS = ["density", "flow", "exits"];
const STREET_LAYERS = ["gates", "parking", "hotels", "transit", "shuttles"];
const point = (angle, rx, ry) => {
  const rad = (angle * Math.PI) / 180;
  return [450 + Math.sin(rad) * rx, 285 - Math.cos(rad) * ry];
};
const wedge = (angle) => {
  const [x1, y1] = point(angle - 20, 295, 190);
  const [x2, y2] = point(angle + 20, 295, 190);
  const [x3, y3] = point(angle + 20, 210, 120);
  const [x4, y4] = point(angle - 20, 210, 120);
  return `M${x1} ${y1} A295 190 0 0 1 ${x2} ${y2} L${x3} ${y3} A210 120 0 0 0 ${x4} ${y4} Z`;
};

function StadiumSchematic({ state, layer, venueName }) {
  const zoneFor = (gate) => state.zones.find((zone) => zone.id === gate.zoneId);
  return <svg viewBox="0 0 900 570" preserveAspectRatio="xMidYMid meet" className="ops-stadium" aria-hidden="true">
    <defs>
      <pattern id="dy-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="var(--line)" strokeWidth=".5" /></pattern>
      <marker id="dy-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="context-stroke" /></marker>
    </defs>
    <rect width="900" height="570" fill="url(#dy-grid)" />
    <ellipse cx="450" cy="285" rx="336" ry="223" fill="none" stroke="var(--line)" strokeDasharray="6 8" />
    <ellipse cx="450" cy="285" rx="305" ry="200" fill="var(--surface)" stroke="var(--muted)" strokeWidth="2" />
    {STADIUM_GATES.map((gate) => {
      const zone = zoneFor(gate);
      const status = zone ? gateStatus(zone, state.rules) : "normal";
      const fill = status === "critical" ? "var(--red)" : status === "attention" ? "var(--amber)" : gate.corridor === "local" ? "#60a5b7" : "#bc8395";
      return <path key={gate.id} d={wedge(gate.angle)} fill={fill} fillOpacity={layer === "density" ? Math.max(.13, (zone?.occupancy || 0) / 250) : .13} stroke={fill} strokeOpacity=".75" strokeWidth="1.5" />;
    })}
    {Array.from({ length: 16 }, (_, i) => i * 22.5).map((angle) => {
      const [x1, y1] = point(angle, 210, 120);
      const [x2, y2] = point(angle, 305, 200);
      return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--line)" />;
    })}
    <ellipse cx="450" cy="285" rx="204" ry="115" fill="var(--surface-soft)" stroke="var(--muted)" />
    <rect x="336" y="222" width="228" height="126" rx="5" fill="#17241d" stroke="#a7b9a9" strokeWidth="1.5" />
    <path d="M450 222V348M336 285H564" stroke="#a7b9a9" strokeWidth="1.4" fill="none" />
    <circle cx="450" cy="285" r="19" fill="none" stroke="#a7b9a9" strokeWidth="1.4" />
    <rect x="336" y="255" width="32" height="60" fill="none" stroke="#a7b9a9" />
    <rect x="532" y="255" width="32" height="60" fill="none" stroke="#a7b9a9" />
    <text x="450" y="376" textAnchor="middle" className="ops-svg-label">{venueName}</text>
    <text x="450" y="39" textAnchor="middle" className="ops-svg-label">LOCAL APPROACH · NORTH / WEST</text>
    <text x="450" y="553" textAnchor="middle" className="ops-svg-label">OUTSTATION APPROACH · EAST / SOUTH</text>
    {layer === "flow" && STADIUM_GATES.map((gate) => {
      const zone = zoneFor(gate);
      const [x1, y1] = point(gate.angle, 385, 260);
      const [x2, y2] = point(gate.angle, 315, 210);
      return <path key={gate.id} d={`M${x1} ${y1}L${x2} ${y2}`} fill="none" stroke={gate.corridor === "local" ? "#60a5b7" : "#bc8395"} strokeWidth={Math.max(2, Math.min(8, (zone?.queue || 0) / 65))} strokeLinecap="round" markerEnd="url(#dy-arrow)" />;
    })}
    {layer === "exits" && STADIUM_GATES.map((gate) => {
      const [x, y] = point(gate.angle, 315, 210);
      return <circle key={gate.id} cx={x} cy={y} r="8" fill={zoneFor(gate)?.open ? "var(--green)" : "var(--red)"} fillOpacity=".8" />;
    })}
  </svg>;
}

export default function VenueMap({ state, selected = "west", onSelect, mode = "crowd", initialView = "schematic" }) {
  const [layer, setLayer] = useState("density");
  const [streetLayer, setStreetLayer] = useState("gates");
  const [view, setView] = useState(initialView);
  const [focusedGateId, setFocusedGateId] = useState(null);
  const focusedGate = STADIUM_GATES.find((gate) => gate.id === focusedGateId && gate.zoneId === selected)
    || STADIUM_GATES.find((gate) => gate.zoneId === selected)
    || STADIUM_GATES[0];
  const focusedZone = state.zones.find((zone) => zone.id === focusedGate.zoneId);
  const dyPatil = isDyPatilVenue(state.event.lat, state.event.lng);
  const layers = view === "street" ? STREET_LAYERS : SCHEMATIC_LAYERS;
  return <section className="ops-map" aria-label="Interactive venue map">
    <div className="ops-map-toolbar">
      <div><span className="ops-kicker">{dyPatil ? DY_PATIL.name : state.event.venue}</span><small className="ops-map-subtitle">{mode === "transport" ? "Fleet and approach routes" : mode === "ground" ? "Personnel and gate sectors" : "Eight gates · four shared telemetry sectors"}</small></div>
      <div className="ops-map-toolbar-actions">
        <div className="ops-segment" aria-label="Map view">{VIEW_OPTIONS.map((option) => <button key={option} type="button" aria-pressed={view === option} onClick={() => setView(option)}>{option === "street" ? "Street map" : "Stadium"}</button>)}</div>
        <div className="ops-segment" aria-label="Map layer">{layers.map((option) => <button key={option} type="button" aria-pressed={view === "street" ? streetLayer === option : layer === option} onClick={() => view === "street" ? setStreetLayer(option) : setLayer(option)}>{option}</button>)}</div>
      </div>
    </div>
    {view === "street" ? <GeoVenueMap state={state} selected={selected} onSelect={onSelect} layer={streetLayer} onGateFocus={setFocusedGateId} /> : <div className="ops-map-canvas">
      <div className="ops-map-coordinate">{dyPatil ? "DY PATIL STADIUM / REFERENCE SCHEMATIC" : "VENUE SCHEMATIC / NOT TO SCALE"}<br /><span>SIMULATED {mode === "transport" ? "VEHICLE" : mode === "ground" ? "PERSONNEL" : "CROWD"} TELEMETRY</span></div>
      <StadiumSchematic state={state} layer={layer} venueName={dyPatil ? "DY PATIL STADIUM · NERUL" : state.event.venue.toUpperCase()} />
      {STADIUM_GATES.map((gate) => {
        const zone = state.zones.find((item) => item.id === gate.zoneId);
        const [x, y] = point(gate.angle, 315, 210);
        return <button key={gate.id} type="button" className={`ops-physical-gate ${gate.corridor} ${zone ? gateStatus(zone, state.rules) : "normal"} ${focusedGate.id === gate.id ? "selected" : ""}`} style={{ left: `${x / 9}%`, top: `${y / 5.7}%` }} onClick={() => { setFocusedGateId(gate.id); onSelect?.(gate.zoneId); }} aria-label={`Gate ${gate.id}, ${gate.name}, ${gate.corridor} corridor, ${zone?.occupancy ?? 0}% sector occupancy`} aria-pressed={focusedGate.id === gate.id} title={`Gate ${gate.id} · ${gate.name} · ${gate.corridor} corridor`}><strong>{gate.id}</strong><span>{zone?.occupancy ?? 0}%</span></button>;
      })}
    </div>}
    <div className="ops-map-focus" aria-live="polite"><strong>GATE {focusedGate.id} · {focusedGate.name}</strong><span>{focusedGate.corridor === "local" ? "Local · North / West" : "Outstation · East / South"}</span><span>{focusedZone?.occupancy ?? 0}% sector occupancy · {(focusedZone?.queue ?? 0).toLocaleString()} waiting · {focusedZone?.open ? "Open" : "Held"}</span></div>
    <div className="ops-map-legend"><Badge>Normal &lt;{state.rules.warning}%</Badge><Badge tone="attention">Attention {state.rules.warning}–{state.rules.critical - 1}%</Badge><Badge tone="critical">Critical ≥{state.rules.critical}%</Badge><span className="ops-mono">GATES A–H FOLLOW FOUR SIMULATED SECTORS</span></div>
  </section>;
}
