"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOperations } from "@/components/operations/OperationsProvider";
import {
  Badge,
  Button,
  Heading,
  Loading,
  Panel,
  Progress,
} from "@/components/operations/UI";

const STEPS = [
  { id: 1, title: "Event Core", desc: "Venue parameters & attendance forecast" },
  { id: 2, title: "Gate Architecture", desc: "Perimeter turnstile quotas & thresholds" },
  { id: 3, title: "Staffing Deployment", desc: "Security, police & volunteer headcounts" },
  { id: 4, title: "Transit Corridors", desc: "Autonomous shuttle fleet & parking hubs" },
  { id: 5, title: "Surge & Alert Rules", desc: "P1/P2/P3 automated triggers & tolerances" },
  { id: 6, title: "Go-Live Commit", desc: "State initialization & simulation launch" },
];

export default function EventSetupWizard() {
  const router = useRouter();
  const { state, send, busy } = useOperations();
  const [currentStep, setCurrentStep] = useState(1);
  const [committed, setCommitted] = useState(false);

  // Form state initialized with standard stadium parameters
  const [formData, setFormData] = useState({
    name: "India vs Australia — World Cup Group Stage",
    venue: "Mumbai International Stadium (Wankhede)",
    lat: 18.9389,
    lng: 72.8258,
    capacity: 54000,
    expected: 48500,
    date: "2026-10-01",
    startTime: "19:30",
    gates: {
      west: { capacity: 18000, warningPct: 75, criticalPct: 90 },
      north: { capacity: 12000, warningPct: 75, criticalPct: 90 },
      east: { capacity: 16000, warningPct: 75, criticalPct: 90 },
      south: { capacity: 8000, warningPct: 70, criticalPct: 85 },
    },
    staffing: {
      security: 100,
      police: 40,
      staff: 50,
      volunteers: 150,
      medical: 15,
    },
    transit: {
      shuttleBuses: 25,
      primaryHub: "P3 (West Approach)",
      reliefHub: "P4 (East Relief)",
      parkingLots: 3,
    },
    rules: {
      warningThreshold: 75,
      criticalThreshold: 90,
      autoIncidentCreation: true,
      autoRerouteRecom: true,
      notificationDelaySec: 30,
    },
  });

  if (!state) return <Loading />;

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleLaunch = async () => {
    const result = await send({ type: "setup", config: formData }, "Event configuration committed.");
    if (result) {
      setCommitted(true);
      router.push("/command-center");
    }
  };

  return (
    <>
      <Heading
        title="Pre-Event Configuration Wizard"
        code="SETUP / CONFIG"
        description="Initialize venue spatial parameters, turnstile limits, personnel rosters, and automated alert rules before kickoff."
      >
        <span className="ops-mono" style={{ color: "var(--ops-muted)" }}>
          STEP 0{currentStep} / 06
        </span>
      </Heading>

      {/* STEPPER PROGRESS TRACK */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "8px",
          marginBottom: "28px",
        }}
      >
        {STEPS.map((s) => (
          <button type="button"
            key={s.id}
            onClick={() => setCurrentStep(s.id)}
            aria-current={currentStep === s.id ? "step" : undefined}
            style={{
              cursor: "pointer",
              padding: "12px",
              border: "1px solid",
              borderColor:
                currentStep === s.id
                  ? "var(--ink)"
                  : currentStep > s.id
                  ? "var(--muted)"
                  : "var(--ops-line)",
              background:
                currentStep === s.id
                  ? "var(--active-nav)"
                  : "var(--surface)",
              borderTop:
                currentStep === s.id
                  ? "2px solid var(--ink)"
                  : "1px solid var(--ops-line)",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "10px",
                color: currentStep >= s.id ? "var(--ink)" : "var(--ops-muted)",
                marginBottom: "4px",
              }}
            >
              0{s.id} // {s.id < currentStep ? "✓ DONE" : s.id === currentStep ? "ACTIVE" : "PENDING"}
            </div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--ink)" }}>
              {s.title}
            </div>
          </button>
        ))}
      </div>

      {/* WIZARD CONTENT BOX */}
      <Panel
        title={`Step 0${currentStep}: ${STEPS[currentStep - 1].title}`}
        meta={STEPS[currentStep - 1].desc}
      >
        <div style={{ padding: "8px 0" }}>

          {/* STEP 1: EVENT CORE */}
          {currentStep === 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--ops-muted)", marginBottom: "6px" }}>
                  EVENT TITLE
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="ops-setup-text"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--ops-muted)", marginBottom: "6px" }}>
                  VENUE DESIGNATION
                </label>
                <input
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="ops-setup-text"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--ops-muted)", marginBottom: "6px" }}>
                  PHYSICAL BOWL CAPACITY (SEATS)
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className="ops-setup-text"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", color: "var(--ops-muted)", marginBottom: "6px" }}>
                  EXPECTED ATTENDEE CONVERGENCE
                </label>
                <input
                  type="number"
                  value={formData.expected}
                  onChange={(e) => setFormData({ ...formData, expected: Number(e.target.value) })}
                  className="ops-setup-text"
                />
              </div>
              <label className="ops-setup-field">VENUE LATITUDE
                <input type="number" step="any" min="-90" max="90" value={formData.lat} onChange={(e) => setFormData({ ...formData, lat: Number(e.target.value) })} />
              </label>
              <label className="ops-setup-field">VENUE LONGITUDE
                <input type="number" step="any" min="-180" max="180" value={formData.lng} onChange={(e) => setFormData({ ...formData, lng: Number(e.target.value) })} />
              </label>
              <label className="ops-setup-field">EVENT DATE
                <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </label>
              <label className="ops-setup-field">START TIME (VENUE LOCAL)
                <input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
              </label>
            </div>
          )}

          {/* STEP 2: GATE ARCHITECTURE */}
          {currentStep === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ fontSize: "12px", color: "var(--ops-muted)", margin: "0 0 8px" }}>
                Set each gate's processing capacity. Global warning and critical thresholds are configured in step 5.
              </p>
              <div className="ops-table-wrap">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Gate Valve</th>
                      <th>Capacity (Spectators)</th>
                      <th>Target Flow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(formData.gates).map(([key, gate]) => (
                      <tr key={key}>
                        <td>
                          <strong>{key.toUpperCase()} GATE</strong>
                        </td>
                        <td><input className="ops-setup-number" type="number" min="100" max={formData.capacity} value={gate.capacity} aria-label={`${key} gate capacity`} onChange={(e) => setFormData((previous) => ({ ...previous, gates: { ...previous.gates, [key]: { ...previous.gates[key], capacity: Number(e.target.value) } } }))} /></td>
                        <td>
                          <span className="ops-mono">{Math.round(gate.capacity / 90)} / min</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: STAFFING DEPLOYMENT */}
          {currentStep === 3 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              {Object.entries(formData.staffing).map(([role, count]) => (
                <div
                  key={role}
                  style={{
                    border: "1px solid var(--ops-line)",
                    background: "rgba(255, 255, 255, 0.02)",
                    padding: "16px",
                  }}
                >
                  <div style={{ fontSize: "11px", color: "var(--ops-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
                    {role} Headcount
                  </div>
                  <input className="ops-setup-number" type="number" min="0" max="2000" value={count} aria-label={`${role} headcount`} onChange={(e) => setFormData((previous) => ({ ...previous, staffing: { ...previous.staffing, [role]: Number(e.target.value) } }))} />
                  <div style={{ fontSize: "10px", color: "var(--ops-muted)", marginTop: "6px" }}>
                    Initial shift deployment ready
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 4: TRANSIT CORRIDORS */}
          {currentStep === 4 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div style={{ border: "1px solid var(--ops-line)", padding: "18px" }}>
                <h4 style={{ margin: "0 0 12px", fontSize: "14px" }}>Shuttle Fleet</h4>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "8px" }}>
                  <input className="ops-setup-number" type="number" min="1" max="200" value={formData.transit.shuttleBuses} aria-label="Shuttle fleet size" onChange={(e) => setFormData((previous) => ({ ...previous, transit: { ...previous.transit, shuttleBuses: Number(e.target.value) } }))} />
                  <span style={{ fontSize: "12px", color: "var(--ops-muted)" }}>VEHICLES PROVISIONED</span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--ops-muted)", margin: 0 }}>
                  Configure the number of vehicles available in the shared dispatch simulation.
                </p>
              </div>

              <div style={{ border: "1px solid var(--ops-line)", padding: "18px" }}>
                <h4 style={{ margin: "0 0 12px", fontSize: "14px" }}>Staging Hub Allocation</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--ops-muted)" }}>Primary Ingress:</span>
                    <strong>{formData.transit.primaryHub}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--ops-muted)" }}>Relief Diversion:</span>
                    <strong>{formData.transit.reliefHub}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--ops-muted)" }}>Active Parking Lots:</span>
                    <strong className="ops-mono">{formData.transit.parkingLots} Facilities</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SURGE & ALERT RULES */}
          {currentStep === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <label className="ops-setup-field">WARNING THRESHOLD %
                <input type="number" min="50" max="98" value={formData.rules.warningThreshold} onChange={(e) => setFormData((previous) => ({ ...previous, rules: { ...previous.rules, warningThreshold: Number(e.target.value) } }))} />
              </label>
              <label className="ops-setup-field">CRITICAL THRESHOLD %
                <input type="number" min="51" max="99" value={formData.rules.criticalThreshold} onChange={(e) => setFormData((previous) => ({ ...previous, rules: { ...previous.rules, criticalThreshold: Number(e.target.value) } }))} />
              </label>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", border: "1px solid var(--ops-line)" }}>
                <div>
                  <strong style={{ display: "block", fontSize: "13px" }}>Autonomous Inflow Incident Creation</strong>
                  <span style={{ fontSize: "11px", color: "var(--ops-muted)" }}>
                    Incidents are raised when a gate reaches the configured critical threshold.
                  </span>
                </div>
                <Badge tone="good">ENGINE RULE</Badge>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", border: "1px solid var(--ops-line)" }}>
                <div>
                  <strong style={{ display: "block", fontSize: "13px" }}>Pre-Computed Route Diversion Recommendations</strong>
                  <span style={{ fontSize: "11px", color: "var(--ops-muted)" }}>
                    Command can dispatch a shuttle diversion when crowd pressure requires it.
                  </span>
                </div>
                <Badge tone="good">AVAILABLE</Badge>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", border: "1px solid var(--ops-line)" }}>
                <div>
                  <strong style={{ display: "block", fontSize: "13px" }}>Emergency Mode Escalation Protocol</strong>
                  <span style={{ fontSize: "11px", color: "var(--ops-muted)" }}>
                    Emergency mode is a simulated escalation; route approval remains a human decision.
                  </span>
                </div>
                <Badge tone="normal">ARMED</Badge>
              </div>
            </div>
          )}

          {/* STEP 6: GO LIVE COMMIT */}
          {currentStep === 6 && (
            <div style={{ textAlign: "center", padding: "32px 20px" }}>
              <div style={{ fontSize: "42px", marginBottom: "16px" }}>⚡</div>
              <h3 style={{ fontSize: "20px", fontWeight: "600", margin: "0 0 12px" }}>Review event configuration</h3>
              <p style={{ maxWidth: "540px", margin: "0 auto 28px", fontSize: "13px", color: "var(--ops-muted)", lineHeight: "1.7" }}>
                Committing updates the shared simulation for this server session. Verify the parameters before launching command.
              </p>
              <dl className="ops-setup-review">
                <div><dt>Event</dt><dd>{formData.name}</dd></div>
                <div><dt>When</dt><dd>{formData.date} · {formData.startTime} venue local</dd></div>
                <div><dt>Venue</dt><dd>{formData.venue}</dd></div>
                <div><dt>Map coordinates</dt><dd>{formData.lat}, {formData.lng}</dd></div>
                <div><dt>Attendance</dt><dd>{formData.expected.toLocaleString()} expected / {formData.capacity.toLocaleString()} capacity</dd></div>
                <div><dt>Ground team</dt><dd>{Object.values(formData.staffing).reduce((sum, count) => sum + count, 0)} staff</dd></div>
                <div><dt>Fleet</dt><dd>{formData.transit.shuttleBuses} shuttle vehicles</dd></div>
                <div><dt>Thresholds</dt><dd>{formData.rules.warningThreshold}% warning / {formData.rules.criticalThreshold}% critical</dd></div>
              </dl>
              <Button
                variant="primary"
                disabled={committed || busy}
                onClick={handleLaunch}
                style={{ padding: "14px 32px", fontSize: "12px" }}
              >
                {committed ? "✓ Opening command center…" : "Commit event setup ↗"}
              </Button>
            </div>
          )}

        </div>

        {/* WIZARD NAVIGATION FOOTER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "32px",
            paddingTop: "20px",
            borderTop: "1px solid var(--ops-line)",
          }}
        >
          <Button
            disabled={currentStep === 1 || committed}
            onClick={handlePrev}
          >
            ← Previous Step
          </Button>

          {currentStep < 6 ? (
            <Button
              variant="primary"
              onClick={handleNext}
            >
              Continue to Step 0{currentStep + 1} →
            </Button>
          ) : null}
        </div>
      </Panel>
    </>
  );
}
