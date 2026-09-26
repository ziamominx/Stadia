"use client";

import { useState, useEffect } from "react";
import { useOperations } from "@/components/operations/OperationsProvider";
import {
  Badge,
  Button,
  Heading,
  Loading,
  Panel,
  Progress,
  Metrics,
  number,
  label,
} from "@/components/operations/UI";

const INITIAL_VIP_DELEGATIONS = [
  {
    id: "VIP-01",
    delegation: "FIFA Executive Delegation",
    hotel: "The Taj Lands End, Bandra",
    size: 14,
    status: "in_transit",
    escort: "Motorcade Escort Alpha",
    gate: "Gate A (North Express)",
    arrivalEta: "19:15 IST",
  },
  {
    id: "VIP-02",
    delegation: "State Government Dignitaries",
    hotel: "Trident Nariman Point",
    size: 8,
    status: "arrived",
    escort: "Police Escort Bravo",
    gate: "Gate A (VIP Pavilion)",
    arrivalEta: "Checked In (Lounge 1)",
  },
  {
    id: "VIP-03",
    delegation: "Broadcasting Council (Host Broadcasters)",
    hotel: "The St. Regis, Lower Parel",
    size: 22,
    status: "standby",
    escort: "Dedicated Shuttle Beta",
    gate: "Gate 4 Media Entrance",
    arrivalEta: "20:00 IST",
  },
  {
    id: "VIP-04",
    delegation: "Team Officials & Technical Staff",
    hotel: "Grand Hyatt Mumbai",
    size: 34,
    status: "arrived",
    escort: "Direct Team Convoy",
    gate: "Underground Tunnel 02",
    arrivalEta: "Checked In (Locker Bay)",
  },
];

export default function HospitalityOperations() {
  const { state, send, busy } = useOperations();
  const [zones, setZones] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [vipList, setVipList] = useState(INITIAL_VIP_DELEGATIONS);
  const [loadingData, setLoadingData] = useState(true);
  const [dispersalActive, setDispersalActive] = useState(false);
  const [alertBanner, setAlertBanner] = useState(null);

  useEffect(() => {
    async function loadHospitality() {
      try {
        const [zRes, mRes] = await Promise.all([
          fetch("/api/hospitality/zones").then((r) => r.json()),
          fetch("/api/hospitality/merchants").then((r) => r.json()),
        ]);
        setZones(Array.isArray(zRes) ? zRes : zRes?.zones || []);
        setMerchants(Array.isArray(mRes) ? mRes : mRes?.merchants || []);
      } catch (err) {
        console.error("Failed to load hospitality data", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadHospitality();
  }, []);

  if (!state || loadingData) return <Loading />;

  const totalRooms = zones.reduce((acc, z) => acc + (z.total_rooms || 0), 0);
  const bookedRooms = zones.reduce((acc, z) => acc + (z.booked_rooms || 0), 0);
  const availableRooms = totalRooms - bookedRooms;
  const avgOccupancy = totalRooms > 0 ? Math.round((bookedRooms / totalRooms) * 100) : 0;

  const handleTriggerDispersal = () => {
    setDispersalActive(true);
    setAlertBanner(
      "DISPERSAL BROADCAST ACTIVE: 15% dining vouchers pushed to 14,200 attendees in West & North stands. Estimated 45-min highway delay achieved."
    );
    send(
      { type: "task", team: "ground", desc: "Hospitality voucher distribution active at concourses." },
      "Hospitality dispersal incentives initiated."
    );
    setTimeout(() => setAlertBanner(null), 8000);
  };

  const handleToggleOverflow = (zoneId) => {
    setZones((prev) =>
      prev.map((z) =>
        z.id === zoneId
          ? { ...z, is_overflow_recommended: z.is_overflow_recommended ? 0 : 1 }
          : z
      )
    );
  };

  const handleDispatchEscort = (vipId) => {
    setVipList((prev) =>
      prev.map((v) =>
        v.id === vipId
          ? { ...v, status: "in_transit", arrivalEta: "En Route · ETA 8 min" }
          : v
      )
    );
  };

  return (
    <>
      <Heading
        title="Hospitality & VIP Command"
        code="05 / HOSPITALITY"
        description="Hotel allotment saturation, VIP motorcade tracking, and post-match dining crowd dispersal."
      >
        <Button
          variant="primary"
          disabled={busy || dispersalActive}
          onClick={handleTriggerDispersal}
        >
          {dispersalActive ? "✓ Dispersal broadcast live" : "↗ Broadcast dining dispersal voucher"}
        </Button>
      </Heading>

      {alertBanner && (
        <div className="ops-alert-banner" style={{
          background: "rgba(16, 185, 129, 0.15)",
          border: "1px solid #10b981",
          color: "#ffffff",
          padding: "12px 18px",
          marginBottom: "20px",
          borderRadius: "2px",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}>
          <span style={{ color: "#10b981" }}>●</span>
          {alertBanner}
        </div>
      )}

      {/* METRIC STRIP */}
      <Metrics
        items={[
          {
            label: "Room Inventory",
            value: number(totalRooms),
            unit: "ROOMS",
            detail: "Across 4 metropolitan corridors",
            tone: "normal",
          },
          {
            label: "City Occupancy",
            value: `${avgOccupancy}%`,
            unit: "BOOKED",
            detail: `${number(availableRooms)} rooms currently available`,
            tone: avgOccupancy > 80 ? "attention" : "normal",
          },
          {
            label: "VIP Delegations",
            value: vipList.length,
            unit: "REGISTERED",
            detail: `${vipList.filter((v) => v.status === "arrived").length} checked in / ${vipList.filter((v) => v.status === "in_transit").length} en route`,
            tone: "normal",
          },
          {
            label: "Dispersal Absorption",
            value: dispersalActive ? "1,850" : "840",
            unit: "FANS",
            detail: dispersalActive ? "Highway congestion mitigated by 19%" : "Standard baseline dining demand",
            tone: dispersalActive ? "good" : "normal",
          },
        ]}
      />

      {/* MAIN TWO-COLUMN DISPATCH LAYOUT */}
      <div className="ops-split-columns" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", marginTop: "24px" }}>
        
        {/* LEFT COLUMN: ACCOMMODATION ZONES & SATURATION */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Panel title="Metropolitan Accommodation Corridors" meta="LIVE SATURATION TELEMETRY">
            <div className="ops-table-wrap">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>Corridor / Zone</th>
                    <th>Occupancy</th>
                    <th>Rooms Available</th>
                    <th>Shuttle Connection</th>
                    <th>Overflow Steering</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map((zone) => {
                    const occ = zone.occupancy_pct || Math.round((zone.booked_rooms / zone.total_rooms) * 100);
                    return (
                      <tr key={zone.id}>
                        <td>
                          <strong>{zone.name}</strong>
                          <div style={{ fontSize: "11px", color: "var(--ops-muted)" }}>{zone.code}</div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "60px" }}>
                              <Progress value={occ} tone={occ > 80 ? "critical" : occ > 70 ? "attention" : "normal"} />
                            </div>
                            <span className="ops-mono">{occ}%</span>
                          </div>
                        </td>
                        <td>
                          <strong>{number(zone.total_rooms - zone.booked_rooms)}</strong>
                          <span style={{ fontSize: "10px", color: "var(--ops-muted)" }}> / {number(zone.total_rooms)}</span>
                        </td>
                        <td style={{ fontSize: "11px", maxWidth: "200px" }}>
                          {zone.transit_link_desc}
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleOverflow(zone.id)}
                            className="ops-button"
                            style={{
                              fontSize: "10px",
                              padding: "4px 8px",
                              background: zone.is_overflow_recommended ? "#ffffff" : "transparent",
                              color: zone.is_overflow_recommended ? "#000000" : "var(--ops-muted)",
                              borderColor: zone.is_overflow_recommended ? "#ffffff" : "var(--ops-line)",
                            }}
                          >
                            {zone.is_overflow_recommended ? "ACTIVE RELIEF" : "STEER HERE"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* DINING MERCHANTS & FAN PERKS */}
          <Panel title="Post-Match Dining Partners & Fan Parks" meta="CONGESTION BUFFER ZONES">
            <p style={{ fontSize: "12px", color: "var(--ops-muted)", margin: "0 0 16px" }}>
              These partner venues absorb outbound spectators for 45+ minutes post-match, smoothing the highway exit peak.
            </p>
            <div className="ops-table-wrap">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>Merchant / Venue</th>
                    <th>Zone</th>
                    <th>Capacity</th>
                    <th>Voucher Code</th>
                    <th>Delay Buffer</th>
                  </tr>
                </thead>
                <tbody>
                  {merchants.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <strong>{m.name}</strong>
                        <div style={{ fontSize: "11px", color: "var(--ops-muted)" }}>{m.description}</div>
                      </td>
                      <td>
                        <span className="ops-mono">{m.zone}</span>
                      </td>
                      <td>
                        <strong>{m.capacity}</strong> seats
                      </td>
                      <td>
                        <span style={{
                          fontFamily: "JetBrains Mono, monospace",
                          background: "rgba(255,255,255,0.06)",
                          padding: "3px 6px",
                          border: "1px solid var(--ops-line)",
                          fontSize: "11px",
                          letterSpacing: "0.06em",
                        }}>
                          {m.voucher_code} (-{m.discount_pct}%)
                        </span>
                      </td>
                      <td>
                        <span className="ops-mono" style={{ color: "#10b981" }}>+{m.egress_delay_mins} min</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        {/* RIGHT COLUMN: VIP DELEGATIONS & PROTOCOL */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <Panel title="VIP Protocol & Escort Status" meta="EXECUTIVE PROTOCOL">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {vipList.map((vip) => (
                <div
                  key={vip.id}
                  style={{
                    border: "1px solid var(--ops-line)",
                    background: "rgba(255, 255, 255, 0.015)",
                    padding: "14px 16px",
                    borderRadius: "2px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <strong>{vip.delegation}</strong>
                    <Badge tone={vip.status === "arrived" ? "good" : vip.status === "in_transit" ? "attention" : "normal"}>
                      {label(vip.status)}
                    </Badge>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--ops-muted)" }}>
                    Hotel: {vip.hotel} ({vip.size} Delegates)
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--ops-muted)", display: "flex", justifyContent: "space-between" }}>
                    <span>Approach: {vip.gate}</span>
                    <span className="ops-mono">{vip.arrivalEta}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: "10px", color: "var(--ops-muted)" }}>{vip.escort}</span>
                    {vip.status === "standby" && (
                      <button
                        onClick={() => handleDispatchEscort(vip.id)}
                        className="ops-button"
                        style={{ fontSize: "10px", padding: "3px 8px" }}
                      >
                        ↗ Dispatch Escort
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Inter-Agency Hospitality Mesh" meta="SHARED AUDIT">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px", color: "var(--ops-muted)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "6px", borderBottom: "1px solid var(--ops-line)" }}>
                <span>Tourism Authority Sync:</span>
                <strong style={{ color: "#ffffff" }}>ACTIVE (1s delta)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "6px", borderBottom: "1px solid var(--ops-line)" }}>
                <span>Highway Patrol Motorcade Link:</span>
                <strong style={{ color: "#ffffff" }}>CLEAR (Channel 4)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "6px", borderBottom: "1px solid var(--ops-line)" }}>
                <span>VIP Concourse Lounge Strain:</span>
                <strong style={{ color: "#ffffff" }}>42% (Normal)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Post-Match Dispersal Pipeline:</span>
                <strong style={{ color: "#10b981" }}>READY</strong>
              </div>
            </div>
          </Panel>
        </div>

      </div>
    </>
  );
}
