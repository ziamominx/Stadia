"use client";
import { useState } from "react";
import { gateStatus } from "@/lib/operations/engine.mjs";
import { Badge } from "./UI";
import GeoVenueMap from "./GeoVenueMap";
const positions = {
  north: [50, 20],
  east: [83, 51],
  south: [50, 81],
  west: [17, 51],
};
export default function VenueMap({
  state,
  selected = "west",
  onSelect,
  mode = "crowd",
  initialView = "schematic",
}) {
  const [layer, setLayer] = useState("density");
  const [view, setView] = useState(initialView);
  const west = state.zones[0],
    active = west.occupancy >= state.rules.warning;
  const color = (id) => {
    const z = state.zones.find((z) => z.id === id);
    return z.fire || gateStatus(z, state.rules) === "critical"
      ? "#c5232b"
      : gateStatus(z, state.rules) === "attention"
        ? "#aa6900"
        : "#087855";
  };
  return (
    <section className="ops-map" aria-label="Interactive venue map">
      <div className="ops-map-toolbar">
        <span className="ops-kicker">
          {mode === "transport"
            ? "Arterial fleet network"
            : mode === "ground"
              ? "Personnel deployment map"
              : "Level 0 · Ground & concourse"}
        </span>
        <div className="ops-map-toolbar-actions"><div className="ops-segment" aria-label="Map view">
          {["schematic", "street"].map((option) => <button key={option} type="button" aria-pressed={view === option} onClick={() => setView(option)}>{option === "street" ? "Street map" : "Schematic"}</button>)}
        </div>{view === "schematic" && <div className="ops-segment" aria-label="Map layer">
          {["density", "flow", "exits"].map((l) => (
            <button
              key={l}
              aria-pressed={layer === l}
              onClick={() => setLayer(l)}
            >
              {l}
            </button>
          ))}
        </div>}</div>
      </div>
      {view === "street" ? <GeoVenueMap state={state} selected={selected} onSelect={onSelect} /> : <>
      <div className="ops-map-canvas">
        <div className="ops-map-coordinate">
          VENUE SCHEMATIC / NOT TO SCALE
          <br />
          <span>
            SIMULATED{" "}
            {mode === "ground"
              ? "PERSONNEL"
              : mode === "transport"
                ? "VEHICLE"
                : "CROWD"}{" "}
            TELEMETRY
          </span>
        </div>
        <svg
          viewBox="0 0 900 570"
          preserveAspectRatio="xMidYMid meet"
          className="ops-stadium"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="stadia-grid"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M30 0H0V30"
                fill="none"
                stroke="#e9eae6"
                strokeWidth=".6"
              />
            </pattern>
            <marker
              id="flow-arrow"
              markerWidth="6"
              markerHeight="6"
              refX="4"
              refY="3"
              orient="auto"
            >
              <path d="M0 0L6 3L0 6Z" fill="context-stroke" />
            </marker>
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#087855" floodOpacity="0.75" />
            </filter>
            <filter id="critical-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#c5232b" floodOpacity="0.8" />
            </filter>
            <linearGradient id="radar-cone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#087855" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#087855" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#087855" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="900" height="570" fill="url(#stadia-grid)" />
          <path
            d="M450 80V490M100 285H800"
            stroke="#d6dad5"
            strokeDasharray="3 6"
          />
          <ellipse
            cx="450"
            cy="287"
            rx="311"
            ry="192"
            fill="none"
            stroke="#c5cbc6"
            strokeDasharray="4 5"
          />
          <ellipse
            cx="450"
            cy="287"
            rx="279"
            ry="165"
            fill="#fff"
            stroke="#d2d7d2"
            strokeWidth="1.5"
          />
          <ellipse
            cx="450"
            cy="287"
            rx="231"
            ry="128"
            fill="none"
            stroke="#edf0ec"
            strokeWidth="40"
          />
          <path
            d="M266 216A229 127 0 0 0 266 358"
            fill="none"
            stroke={layer === "density" ? color("west") : "#9aa49d"}
            strokeOpacity=".17"
            strokeWidth="40"
          />
          <path
            d="M300 190Q450 111 600 190M300 384Q450 460 600 384"
            fill="none"
            stroke="#087855"
            strokeOpacity=".08"
            strokeWidth="32"
          />
          <ellipse
            cx="450"
            cy="287"
            rx="178"
            ry="94"
            fill="#e6eee8"
            stroke="#a8c7b7"
          />
          <rect x="436" y="260" width="28" height="54" fill="#d8caac" />
          <path d="M437 271H463M437 301H463" stroke="#fff" />
          <g className="ops-radar-sweep">
            <path
              d="M450 287 L450 193 A94 94 0 0 1 544 287 Z"
              fill="url(#radar-cone)"
            />
            <line
              x1="450"
              y1="287"
              x2="450"
              y2="193"
              stroke="#087855"
              strokeWidth="2.5"
              strokeOpacity="0.85"
            />
          </g>
          <text x="450" y="333" textAnchor="middle" className="ops-svg-label">
            MATCH IN PLAY
          </text>
          <text x="450" y="174" textAnchor="middle" className="ops-svg-label">
            NORTH STAND
          </text>
          <text x="450" y="410" textAnchor="middle" className="ops-svg-label">
            SOUTH CONCOURSE
          </text>
          <text
            x="655"
            y="288"
            textAnchor="middle"
            transform="rotate(90 655 288)"
            className="ops-svg-label"
          >
            EAST STAND
          </text>
          <text
            x="246"
            y="288"
            textAnchor="middle"
            transform="rotate(-90 246 288)"
            className="ops-svg-label"
          >
            WEST STAND
          </text>
          {(layer === "flow" || mode === "transport") && (
            <g
              fill="none"
              strokeWidth="3.5"
              className="ops-flow-stream"
              markerEnd="url(#flow-arrow)"
              filter="url(#neon-glow)"
            >
              <path d="M52 399Q102 390 153 302" stroke={color("west")} filter={active ? "url(#critical-glow)" : "url(#neon-glow)"} />
              <path d="M790 401Q743 370 732 302" stroke="#087855" />
              <path d="M750 411Q455 543 193 382" stroke="#087855" />
            </g>
          )}
          <path
            d="M100 418L181 343"
            stroke={active ? "#c5232b" : "#087855"}
            strokeWidth="3.5"
            className="ops-flow-stream"
            filter={active ? "url(#critical-glow)" : "url(#neon-glow)"}
          />
          <path
            d="M804 418L719 346"
            stroke="#087855"
            strokeWidth="3.5"
            className="ops-flow-stream"
            filter="url(#neon-glow)"
          />
          {mode === "ground" &&
            [320, 350, 380, 410, 440, 470, 500, 530, 560, 590].map((x, i) => (
              <g key={x}>
                <circle
                  cx={x}
                  cy={i % 2 ? 434 : 140}
                  r="4"
                  fill={i % 3 ? "#087855" : "#151a16"}
                />
                <circle
                  cx={x + 6}
                  cy={i % 2 ? 446 : 128}
                  r="3"
                  fill="#b27927"
                />
              </g>
            ))}
          {mode === "transport" &&
            state.buses
              .filter((b) => b.status !== "standby")
              .slice(0, 10)
              .map((b, i) => (
                <g
                  key={b.id}
                  transform={`translate(${b.hub === "P3" ? 78 + i * 9 : 733 + (i % 5) * 19},${370 + (i % 3) * 14})`}
                >
                  <rect
                    width="13"
                    height="8"
                    fill={b.hub === "P3" && active ? "#c5232b" : "#087855"}
                  />
                </g>
              ))}
        </svg>
        {state.zones.map((z) => (
          <button
            key={z.id}
            className={`ops-map-pin ${gateStatus(z, state.rules)} ${selected === z.id ? "selected" : ""}`}
            style={{
              left: `${positions[z.id][0]}%`,
              top: `${positions[z.id][1]}%`,
            }}
            onClick={() => onSelect?.(z.id)}
            aria-label={`${z.name}, ${z.occupancy}% occupancy${z.fire ? ", fire alert" : ""}`}
            aria-pressed={selected === z.id}
          >
            <span>{z.name}</span>
            <strong>{z.fire ? "⚠" : `${z.occupancy}%`}</strong>
            {layer === "exits" && (
              <small>{state.exits.find((e) => e.zone === z.id)?.status}</small>
            )}
          </button>
        ))}
        <div className={`ops-hub p3 ${active ? "critical" : "normal"}`}>
          <span className="ops-kicker">Transit hub P3</span>
          <strong>{state.hubs[0].queue.toLocaleString()} waiting</strong>
          <small>WEST GATE APPROACH</small>
        </div>
        <div className="ops-hub p4 normal">
          <span className="ops-kicker">Transit hub P4</span>
          <strong>
            {state.buses.filter((b) => b.hub === "P4").length} coaches
          </strong>
          <small>EAST RELIEF CORRIDOR</small>
        </div>
      </div>
      </>}
      <div className="ops-map-legend">
        <Badge>Normal &lt;{state.rules.warning}%</Badge>
        <Badge tone="attention">
          Attention {state.rules.warning}–{state.rules.critical - 1}%
        </Badge>
        <Badge tone="critical">Critical ≥{state.rules.critical}%</Badge>
        <span className="ops-mono">SELECT A ZONE TO INSPECT ↗</span>
      </div>
    </section>
  );
}
