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
  number,
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
    capacity: 54000,
    expected: 48500,
    startTime: "19:30 IST",
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

  const handleLaunch = () => {
    setCommitted(true);
    send(
      {
        type: "task",
        team: "ground",
        desc: `Event core setup committed: ${formData.name} initialized with ${number(formData.expected)} expected spectators.`,
      },
      "Pre-event architecture committed to shared state."
    );
    setTimeout(() => {
      router.push("/command-center");
    }, 1800);
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
          <div
            key={s.id}
            onClick={() => setCurrentStep(s.id)}
            style={{
              cursor: "pointer",
              padding: "12px",
              border: "1px solid",
              borderColor:
                currentStep === s.id
                  ? "#ffffff"
                  : currentStep > s.id
                  ? "rgba(255, 255, 255, 0.4)"
                  : "var(--ops-line)",
              background:
                currentStep === s.id
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(255, 255, 255, 0.015)",
              borderTop:
                currentStep === s.id
                  ? "2px solid #ffffff"
                  : "1px solid var(--ops-line)",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "10px",
                color: currentStep >= s.id ? "#ffffff" : "var(--ops-muted)",
                marginBottom: "4px",
              }}
            >
              0{s.id} // {s.id < currentStep ? "✓ DONE" : s.id === currentStep ? "ACTIVE" : "PENDING"}
            </div>
            <div style={{ fontSize: "12px", fontWeight: "600", color: "#ffffff" }}>
              {s.title}
            </div>
          </div>
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
                  className="ops-input"
                  style={{ width: "100%", background: "#000", border: "1px solid var(--ops-line)", color: "#fff", padding: "10px 14px" }}
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
                  style={{ width: "100%", background: "#000", border: "1px solid var(--ops-line)", color: "#fff", padding: "10px 14px" }}
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
                  style={{ width: "100%", background: "#000", border: "1px solid var(--ops-line)", color: "#fff", padding: "10px 14px" }}
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
                  style={{ width: "100%", background: "#000", border: "1px solid var(--ops-line)", color: "#fff", padding: "10px 14px" }}
                />
              </div>
            </div>
          )}

          {/* STEP 2: GATE ARCHITECTURE */}
          {currentStep === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ fontSize: "12px", color: "var(--ops-muted)", margin: "0 0 8px" }}>
                Calibrate throughput capacities and saturation alert thresholds per perimeter valve:
              </p>
              <div className="ops-table-wrap">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Gate Valve</th>
                      <th>Capacity (Spectators)</th>
                      <th>Warning Threshold</th>
                      <th>Critical Threshold</th>
                      <th>Target Flow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(formData.gates).map(([key, gate]) => (
                      <tr key={key}>
                        <td>
                          <strong>{key.toUpperCase()} GATE</strong>
                        </td>
                        <td>{number(gate.capacity)}</td>
                        <td>
                          <span className="ops-mono" style={{ color: "#eab308" }}>{gate.warningPct}%</span>
                        </td>
                        <td>
                          <span className="ops-mono" style={{ color: "#ef4444" }}>{gate.criticalPct}%</span>
                        </td>
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
                  <div style={{ fontSize: "28px", fontWeight: "700", fontFamily: "JetBrains Mono, monospace" }}>
                    {count}
                  </div>
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
                <h4 style={{ margin: "0 0 12px", fontSize: "14px" }}>Autonomous Shuttle Fleet</h4>
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "32px", fontWeight: "700", fontFamily: "JetBrains Mono" }}>
                    {formData.transit.shuttleBuses}
                  </span>
                  <span style={{ fontSize: "12px", color: "var(--ops-muted)" }}>VEHICLES PROVISIONED</span>
                </div>
                <p style={{ fontSize: "12px", color: "var(--ops-muted)", margin: 0 }}>
                  High-capacity electric shuttles operating on 3-minute headways between transit hubs and perimeter gates.
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", border: "1px solid var(--ops-line)" }}>
                <div>
                  <strong style={{ display: "block", fontSize: "13px" }}>Autonomous Inflow Incident Creation</strong>
                  <span style={{ fontSize: "11px", color: "var(--ops-muted)" }}>
                    Automatically instantiate incidents when any gate exceeds 75% strain for {">"} 3 minutes.
                  </span>
                </div>
                <Badge tone="good">ENABLED</Badge>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", border: "1px solid var(--ops-line)" }}>
                <div>
                  <strong style={{ display: "block", fontSize: "13px" }}>Pre-Computed Route Diversion Recommendations</strong>
                  <span style={{ fontSize: "11px", color: "var(--ops-muted)" }}>
                    Propose shuttle diversions to P4 Relief when West Gate approaches 90% threshold.
                  </span>
                </div>
                <Badge tone="good">ENABLED</Badge>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", border: "1px solid var(--ops-line)" }}>
                <div>
                  <strong style={{ display: "block", fontSize: "13px" }}>Emergency Mode Escalation Protocol</strong>
                  <span style={{ fontSize: "11px", color: "var(--ops-muted)" }}>
                    Unlock all optical turnstiles and open emergency concourse corridors on code-red alert.
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
              <h3 style={{ fontSize: "20px", fontWeight: "600", margin: "0 0 12px" }}>
                Ready to Commit Configuration to Shared Live State
              </h3>
              <p style={{ maxWidth: "540px", margin: "0 auto 28px", fontSize: "13px", color: "var(--ops-muted)", lineHeight: "1.7" }}>
                Committing will initialize the real-time simulation engine for <strong>{formData.name}</strong>,
                lock perimeter gate allocations, assign personnel rosters, and establish live inter-agency telemetry.
              </p>
              <Button
                variant="primary"
                disabled={committed}
                onClick={handleLaunch}
                style={{ padding: "14px 32px", fontSize: "12px" }}
              >
                {committed ? "✓ Launching Live Command Center…" : "⚡ Commit Architecture & Launch Live Event"}
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
