"use client";
import { useEffect, useState } from "react";
import { useOperations } from "@/components/operations/OperationsProvider";
import { Badge, Button, Heading, Loading, Metrics, Panel, Progress, number } from "@/components/operations/UI";
import GeoVenueMap from "@/components/operations/GeoVenueMap";
import { STADIUM_GATES } from "@/lib/operations/dy-patil.mjs";

const MAP_LAYERS = [
  ["gates", "Stadium gates"],
  ["hotels", "Accommodation"],
  ["transit", "Rail & feeder"],
  ["shuttles", "Shuttles"],
  ["parking", "Parking"],
];
const MAP_DESCRIPTIONS = {
  gates: "Select a gate to inspect its current simulated sector load.",
  hotels: "Partner hotel positions are reference locations; availability comes from the separate reference dataset below.",
  transit: "Indicative station and feeder corridors leading to the venue.",
  shuttles: "Indicative shuttle corridors; vehicle locations are not live GPS positions.",
  parking: "Reference parking sites around the venue.",
};

export default function HospitalityOperations() {
  const { state, send, busy } = useOperations();
  const [zones, setZones] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [error, setError] = useState("");
  const [merchantError, setMerchantError] = useState("");
  const [message, setMessage] = useState("");
  const [mapLayer, setMapLayer] = useState("gates");
  const [selectedGate, setSelectedGate] = useState("A");
  const [copyStatus, setCopyStatus] = useState("");
  useEffect(() => {
    let active = true;
    fetch("/api/hospitality/zones", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Hotel reference data is unavailable.");
      const data = await response.json();
      if (active) setZones(Array.isArray(data) ? data : data.zones || []);
    }).catch((failure) => { if (active) setError(failure.message); });
    fetch("/api/hospitality/merchants", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Partner dining data is unavailable.");
      const data = await response.json();
      if (active) setMerchants(Array.isArray(data) ? data : data.merchants || []);
    }).catch((failure) => { if (active) setMerchantError(failure.message); });
    return () => { active = false; };
  }, []);
  if (!state) return <Loading />;
  const rooms = zones.reduce((sum, zone) => sum + (zone.total_rooms || 0), 0);
  const booked = zones.reduce((sum, zone) => sum + (zone.booked_rooms || 0), 0);
  const requests = state.hospitalityRequests || [];
  const gate = STADIUM_GATES.find((item) => item.id === selectedGate) || STADIUM_GATES[0];
  const gateZone = state.zones.find((zone) => zone.id === gate.zoneId);
  const copyVoucher = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus(`${code} copied to clipboard.`);
    } catch {
      setCopyStatus(`Copy unavailable. Voucher code: ${code}`);
    }
  };
  return <>
    <Heading title="Hospitality Operations" code="05 / HOSPITALITY" description="Facility queues and partner reference inventory in one focused view.">
      <Badge>Operational simulation</Badge>
    </Heading>
    <div className="ops-note"><p>Venue queues come from the shared demo state. Hotel inventory is a seeded reference dataset; no partner booking feed is connected. Street map tiles are live OpenStreetMap data.</p></div>
    <Metrics items={[
      { label: "Venue facilities", value: state.facilities.length, detail: "Shared simulation" },
      { label: "Hotel zones", value: zones.length, detail: "Reference dataset" },
      { label: "Reference rooms", value: number(rooms - booked), detail: `of ${number(rooms)} listed` },
      {
        label: "Demand forecast",
        value: state.ml?.hospitality?.alertLevel?.toUpperCase() ?? "LOW",
        detail: state.ml?.hospitality
          ? `${state.ml.hospitality.recentRequests} requests · last 10 min`
          : `${requests.filter((r) => r.status === "open").length} open requests`,
        tone: state.ml?.hospitality?.alertLevel === "high" ? "critical" : state.ml?.hospitality?.alertLevel === "medium" ? "attention" : "normal",
      },
    ]} />
    <section className="ops-hospitality-map" aria-label="Interactive stadium and route map">
      <div className="ops-hospitality-map-heading">
        <div><span className="ops-kicker">LIVE GEOSPATIAL LAYERS</span><h2>Stadium &amp; route map</h2><p>OpenStreetMap street detail with selectable stadium gates and hospitality approach layers.</p></div>
        <span className="ops-mono">DY PATIL / NERUL</span>
      </div>
      <div className="ops-hospitality-map-controls" role="group" aria-label="Map layer">
        {MAP_LAYERS.map(([key, label]) => <button key={key} type="button" aria-pressed={mapLayer === key} onClick={() => setMapLayer(key)}>{label}</button>)}
      </div>
      <GeoVenueMap state={state} selected={gate.zoneId} layer={mapLayer} onGateFocus={setSelectedGate} />
      <div className="ops-hospitality-map-detail" aria-live="polite">
        <div><strong>Gate {gate.id} · {gate.name}</strong><span>{gateZone?.occupancy ?? 0}% simulated sector occupancy · {number(gateZone?.queue ?? 0)} waiting</span></div>
        <p>{MAP_DESCRIPTIONS[mapLayer]}</p>
      </div>
    </section>
    <div className="ops-config-grid">
      <Panel title="Venue facility queues" meta="SHARED SIMULATION">
        <div className="ops-resource-grid">
          {state.facilities.map((facility) => <div key={facility.id}>
            <div className="ops-row"><h3>{facility.name}</h3><Badge>{facility.queue} waiting</Badge></div>
            <p className="ops-muted">Zone: {facility.zone} · Estimated wait {Math.ceil(facility.queue / facility.rate)} min at current service rate</p>
            <Progress value={Math.min(100, facility.queue)} />
          </div>)}
        </div>
      </Panel>
      <Panel title="Request executive support" meta="SHARED EVENT STATE">
        <div className="ops-padded">
          {state.ml?.hospitality && state.ml.hospitality.alertLevel !== "low" && (
            <div className="ops-ml-demand-banner">
              <span className="ops-ml-chip">
                {state.ml.hospitality.alertLevel === "high" ? "⚠ High demand" : "▲ Medium demand"}
              </span>
              <p>ML projects ~{state.ml.hospitality.projectedNext5} more requests in the next 5 sim-minutes. Consider pre-positioning staff.</p>
            </div>
          )}
          <p className="ops-muted">Describe a verified hospitality issue. Command will see and acknowledge the request.</p>
          <label className="ops-field">Issue or support needed
            <textarea rows={4} maxLength={240} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="For example: East food court needs two more queue stewards." />
          </label>
          <Button variant="primary" disabled={busy || message.trim().length < 10} onClick={async () => {
            if (await send({ type: "hospitality_request", message }, "Request sent to executive command.")) setMessage("");
          }}>Send request ↗</Button>
        </div>
      </Panel>
    </div>
    <div className="ops-config-grid">
      <Panel title="Partner accommodation zones" meta="REFERENCE DATA / NOT LIVE INVENTORY">
        {error && <p role="alert" className="ops-padded">{error}</p>}
        {!error && !zones.length && <p className="ops-padded">Loading partner reference data…</p>}
        <div className="ops-table-wrap"><table className="ops-table"><thead><tr><th>Zone</th><th>Rooms listed</th><th>Booked in dataset</th><th>Availability in dataset</th></tr></thead><tbody>{zones.map((zone) => <tr key={zone.id}><td><strong>{zone.name}</strong></td><td>{number(zone.total_rooms || 0)}</td><td>{number(zone.booked_rooms || 0)}</td><td>{number(Math.max(0, (zone.total_rooms || 0) - (zone.booked_rooms || 0)))}</td></tr>)}</tbody></table></div>
      </Panel>
      <Panel title="Dining & dispersal partners" meta="REFERENCE OFFERS / NOT LIVE REDEMPTIONS">
        {merchantError && <p role="alert" className="ops-padded">{merchantError}</p>}
        {!merchantError && !merchants.length && <p className="ops-padded">Loading partner reference data…</p>}
        <div className="ops-resource-grid">{merchants.map((merchant) => <div key={merchant.id} className="ops-hospitality-partner">
          <div className="ops-row"><div><strong>{merchant.name}</strong><p className="ops-muted">{merchant.zone} · {merchant.category.replaceAll("_", " ")}</p></div><Badge>{merchant.discount_pct}% offer</Badge></div>
          <p className="ops-muted">{merchant.description}</p>
          <div className="ops-row"><span className="ops-mono">+{merchant.egress_delay_mins} MIN DISPERSAL WINDOW · {number(merchant.capacity)} PLACES</span><Button onClick={() => copyVoucher(merchant.voucher_code)}>Copy code</Button></div>
        </div>)}</div>
        <p className="ops-hospitality-copy-status" role="status">{copyStatus}</p>
      </Panel>
    </div>
    <Panel title="Requests to command" meta="THIS SERVER SESSION">
      {requests.length ? <div className="ops-resource-grid">{requests.map((request) => <div key={request.id}><div className="ops-row"><strong>{request.id}</strong><Badge tone={request.status === "open" ? "attention" : "normal"}>{request.status}</Badge></div><p>{request.message}</p></div>)}</div> : <p className="ops-padded">No requests have been sent.</p>}
    </Panel>
  </>;
}
