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
const ovalRing = (outerX, outerY, innerX, innerY) =>
  `M${450 + outerX} 285 A${outerX} ${outerY} 0 1 0 ${450 - outerX} 285 A${outerX} ${outerY} 0 1 0 ${450 + outerX} 285 Z M${450 + innerX} 285 A${innerX} ${innerY} 0 1 1 ${450 - innerX} 285 A${innerX} ${innerY} 0 1 1 ${450 + innerX} 285 Z`;
const SEATING_ROWS = Array.from({ length: 6 }, (_, row) => {
  const rx = 218 + row * 12;
  const ry = 126 + row * 10;
  const d = Array.from({ length: 144 }, (_, seat) => {
    const angle = seat * 2.5;
    if (Math.abs(((angle + 22.5) % 45) - 22.5) < 3.5) return "";
    const [x1, y1] = point(angle, rx, ry);
    const [x2, y2] = point(angle, rx + 3, ry + 2);
    return `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }).join(" ");
  return { d, row };
});

function StadiumSchematic({ state, layer, venueName }) {
  const zoneFor = (gate) => state.zones.find((zone) => zone.id === gate.zoneId);
  return <svg viewBox="0 0 900 570" preserveAspectRatio="xMidYMid meet" className="ops-stadium" aria-hidden="true">
    <defs>
      <pattern id="dy-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="var(--line)" strokeWidth=".5" /></pattern>
      <linearGradient id="dy-roof" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#b9c1c6" stopOpacity=".82" /><stop offset=".45" stopColor="#36434b" stopOpacity=".9" /><stop offset="1" stopColor="#9daeb8" stopOpacity=".72" /></linearGradient>
      <linearGradient id="dy-seats" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#223947" /><stop offset=".55" stopColor="#111f2a" /><stop offset="1" stopColor="#314450" /></linearGradient>
      <linearGradient id="dy-field" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#1d3b32" /><stop offset="1" stopColor="#0d211c" /></linearGradient>
      <clipPath id="dy-outfield-clip"><ellipse cx="450" cy="285" rx="204" ry="116" /></clipPath>
      <marker id="dy-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="context-stroke" /></marker>
    </defs>
    <rect width="900" height="570" fill="url(#dy-grid)" />
    <path d="M450 55V81M450 489V515M109 285H137M763 285H791" stroke="var(--muted)" strokeWidth="1" opacity=".65" />
    <ellipse cx="450" cy="296" rx="329" ry="218" fill="#000" opacity=".24" />
    <ellipse cx="450" cy="285" rx="349" ry="235" fill="none" stroke="var(--muted)" strokeOpacity=".45" strokeDasharray="3 7" />
    <ellipse cx="450" cy="285" rx="332" ry="221" fill="none" stroke="var(--muted)" strokeOpacity=".55" />
    <ellipse cx="450" cy="285" rx="294" ry="190" fill="url(#dy-seats)" stroke="#a4b5bc" strokeOpacity=".55" strokeWidth="2" />
    {STADIUM_GATES.map((gate) => {
      const zone = zoneFor(gate);
      const status = zone ? gateStatus(zone, state.rules) : "normal";
      const fill = status === "critical" ? "var(--red)" : status === "attention" ? "var(--amber)" : gate.corridor === "local" ? "#60a5b7" : "#bc8395";
      return <path key={gate.id} d={wedge(gate.angle)} fill={fill} fillOpacity={layer === "density" ? Math.max(.08, (zone?.occupancy || 0) / 400) : .07} stroke={fill} strokeOpacity=".48" strokeWidth="1" />;
    })}
    {[226, 242, 258, 274].map((rx, index) => <ellipse key={rx} cx="450" cy="285" rx={rx} ry={133 + index * 10} fill="none" stroke="#9bb0be" strokeOpacity=".22" strokeWidth="2" />)}
    {STADIUM_GATES.map((gate) => {
      const [x1, y1] = point(gate.angle, 207, 118);
      const [x2, y2] = point(gate.angle, 293, 189);
      return <g key={gate.id}><path d={`M${x1} ${y1}L${x2} ${y2}`} stroke="#071017" strokeWidth="7" /><path d={`M${x1} ${y1}L${x2} ${y2}`} stroke="#9dafb8" strokeOpacity=".4" strokeWidth="1.5" /></g>;
    })}
    {SEATING_ROWS.map(({ d, row }) => <path key={row} d={d} fill="none" stroke={row % 2 ? "#a7bccb" : "#7596ac"} strokeOpacity={row % 2 ? ".63" : ".75"} strokeWidth="2.5" strokeLinecap="round" />)}
    <path d={ovalRing(327, 216, 284, 181)} fill="url(#dy-roof)" fillRule="evenodd" stroke="#aebdc5" strokeOpacity=".7" strokeWidth="1.5" />
    {Array.from({ length: 32 }, (_, i) => i * 11.25).map((angle) => {
      const [x1, y1] = point(angle, 286, 183);
      const [x2, y2] = point(angle, 326, 215);
      return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e2e9e9" strokeOpacity=".46" strokeWidth="1.4" />;
    })}
    <ellipse cx="450" cy="285" rx="283" ry="180" fill="none" stroke="#e0e8e8" strokeOpacity=".72" strokeWidth="2" />
    <ellipse cx="450" cy="285" rx="331" ry="219" fill="none" stroke="#e0e8e8" strokeOpacity=".5" />
    <ellipse cx="450" cy="285" rx="209" ry="120" fill="#091813" stroke="#bdc9c1" strokeOpacity=".67" strokeWidth="3" />
    <ellipse cx="450" cy="285" rx="204" ry="116" fill="url(#dy-field)" />
    <g clipPath="url(#dy-outfield-clip)" opacity=".28">{Array.from({ length: 10 }, (_, i) => <rect key={i} x={246 + i * 42} y="168" width="21" height="234" fill="#7da08a" />)}</g>
    <ellipse cx="450" cy="285" rx="204" ry="116" fill="none" stroke="#a2b7a7" strokeOpacity=".72" strokeWidth="1.5" />
    <path d="M247 285H653M450 169V401" stroke="#d5e3d7" strokeOpacity=".24" strokeDasharray="3 6" />
    <rect x="330" y="216" width="240" height="138" rx="1" fill="#0e2a21" fillOpacity=".9" stroke="#d5e3d7" strokeWidth="1.6" />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={331 + i * 40} y="217" width="20" height="136" fill="#9fbd9c" fillOpacity=".07" />)}
    <path d="M450 216V354M330 285H570" stroke="#d5e3d7" strokeWidth="1.5" fill="none" />
    <circle cx="450" cy="285" r="19" fill="none" stroke="#d5e3d7" strokeWidth="1.5" />
    <circle cx="450" cy="285" r="2" fill="#d5e3d7" />
    <path d="M330 250H366V320H330M570 250H534V320H570M330 268H343V302H330M570 268H557V302H570" fill="none" stroke="#d5e3d7" strokeWidth="1.2" />
    <path d="M325 276h5v18h-5M575 276h-5v18h5" fill="none" stroke="#e9eeee" strokeWidth="2" />
    <g fill="#101820" stroke="#d2dee3" strokeWidth="1"><rect x="193" y="270" width="35" height="25" rx="2" /><rect x="672" y="270" width="35" height="25" rx="2" /></g>
    <g fill="#8db7c8" fontSize="5" fontFamily="monospace" textAnchor="middle"><text x="210" y="280">DY PATIL</text><text x="210" y="288">LED 01</text><text x="689" y="280">DY PATIL</text><text x="689" y="288">LED 02</text></g>
    {[[131, 102], [769, 102], [131, 468], [769, 468]].map(([x, y], index) => <g key={index} transform={`translate(${x} ${y})`} fill="none" stroke="#c8d2d6" strokeOpacity=".72"><circle r="15" strokeDasharray="2 3" /><path d="M-9 -9L9 9M9 -9L-9 9M-11 0H11M0 -11V11" strokeWidth="1.3" /><circle r="3" fill="#d5e1e4" /></g>)}
    <text x="450" y="433" textAnchor="middle" className="ops-svg-label">{venueName}</text>
    <text x="450" y="449" textAnchor="middle" className="ops-svg-label">CANTILEVER ROOF · TIERED SEATING · EVENT FIELD</text>
    <text x="450" y="39" textAnchor="middle" className="ops-svg-label">LOCAL APPROACH · NORTH / WEST</text>
    <text x="450" y="553" textAnchor="middle" className="ops-svg-label">OUTSTATION APPROACH · EAST / SOUTH</text>
    <g transform="translate(850 86)" fill="none" stroke="var(--muted)" strokeWidth="1.4"><path d="M0 18V-10M-5 -2L0 -12L5 -2" /><text x="0" y="-18" textAnchor="middle" fill="var(--muted)" stroke="none" fontSize="10" fontFamily="monospace">N</text></g>
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
