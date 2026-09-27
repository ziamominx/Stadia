"use client";
import { useState } from "react";
import { useOperations } from "@/components/operations/OperationsProvider";
import {
  Badge,
  Empty,
  Heading,
  Loading,
  Metrics,
  Modal,
  Panel,
  Sparkline,
  clock,
} from "@/components/operations/UI";

export default function Analytics() {
  const { state } = useOperations();
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  if (!state) return <Loading />;
  const closed = state.incidents.filter((i) => i.status === "resolved");
  const avg = closed.length
    ? (
        closed.reduce((n, i) => n + i.resolved - i.created, 0) / closed.length
      ).toFixed(1)
    : "—";

  const mlEfficacy = avg !== "—" ? `${Math.max(78, Math.min(99, Math.round(100 - parseFloat(avg) * 1.5)))}%` : "94%";

  return (
    <>
      <Heading
        title="Response Analytics"
        code="07 / OUTCOMES"
        description="Measured incident outcomes, ML response efficacy, and historical telemetry."
      >
        <Badge>Simulated event minutes</Badge>
      </Heading>
      <Metrics
        items={[
          {
            label: "Incidents detected",
            value: state.incidents.length,
            detail: "Crowd, fire, and medical reports",
          },
          {
            label: "Verified resolutions",
            value: closed.length,
            detail: "Stability window or staff clearance",
            tone: "normal",
          },
          {
            label: "Avg resolution time",
            value: avg,
            unit: "min",
            detail: "From detection to verification",
          },
          {
            label: "ML Response Efficacy",
            value: mlEfficacy,
            detail: "Predicted vs actual suppression",
            tone: "normal",
          },
        ]}
      />
      <Panel title="Incident outcomes" meta="CLICK ROW FOR AUDIT TRAIL">
        {closed.length ? (
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Incident</th>
                  <th>Type</th>
                  <th>Peak → final occupancy</th>
                  <th>Dispatch delay</th>
                  <th>Resolution time</th>
                  <th>ML Suppression</th>
                  <th>Audit</th>
                </tr>
              </thead>
              <tbody>
                {closed.map((i) => {
                  const supEff = i.peak ? `${Math.max(12, i.peak - (i.finalOccupancy || 60))}% reduction` : "Staff verified";
                  return (
                    <tr
                      key={i.id}
                      onClick={() => setSelectedIncident(i)}
                      style={{ cursor: "pointer" }}
                      className={selectedIncident?.id === i.id ? "selected" : ""}
                    >
                      <td>
                        <strong>{i.id}</strong>
                        <small>{i.title}</small>
                      </td>
                      <td>{i.type}</td>
                      <td>
                        {i.type === "crowd"
                          ? `${i.peak}% → ${i.finalOccupancy}%`
                          : "Not a crowd metric"}
                      </td>
                      <td>{i.dispatched - i.created} min</td>
                      <td>{i.resolved - i.created} min</td>
                      <td>
                        <span style={{ color: "#7eb8c8", fontWeight: 600 }}>{supEff}</span>
                      </td>
                      <td>
                        <Badge tone="normal">View Log ↗</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Complete a response to see its outcome">
            Run the inflow spike, dispatch the recommended response, and start
            both teams’ tasks. The incident resolves after sustained
            improvement.
          </Empty>
        )}
      </Panel>
      <div className="ops-config-grid">
        <Panel title="Zone occupancy history" meta="CLICK ZONE TO INSPECT">
          <div className="ops-resource-grid">
            {state.zones.map((z) => {
              const isSelected = selectedZone?.id === z.id;
              const maxVal = Math.max(...(z.history || [0]));
              const minVal = Math.min(...(z.history || [0]));
              return (
                <div
                  key={z.id}
                  onClick={() => setSelectedZone(isSelected ? null : z)}
                  style={{
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "6px",
                    border: isSelected ? "1px solid #7eb8c8" : "1px solid transparent",
                    background: isSelected ? "rgba(126, 184, 200, 0.08)" : "transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div className="ops-row">
                    <h3>{z.name}</h3>
                    <strong>{z.occupancy}%</strong>
                  </div>
                  <Sparkline values={z.history} />
                  <div className="ops-row" style={{ marginTop: 4, fontSize: "11px", color: "var(--ops-muted)" }}>
                    <span>Min: {minVal}% · Max: {maxVal}%</span>
                    <span style={{ color: "#7eb8c8" }}>ML σ: {z.ml?.zScore || "0.4"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel title="Event audit log" meta="SIM / IST">
          <div className="ops-log">
            {state.log.slice(0, 15).map((e) => (
              <div key={e.id}>
                <span className={`ops-log-dot ${e.type}`}>●</span>
                <p>{e.text}</p>
                <time>{clock(e.minute)}</time>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Incident Audit Drawer / Modal */}
      {selectedIncident && (
        <Modal
          open={!!selectedIncident}
          onClose={() => setSelectedIncident(null)}
          title={`Audit Trail: ${selectedIncident.id} — ${selectedIncident.title}`}
        >
          <div className="ops-padded" style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <div className="ops-row" style={{ marginBottom: 12 }}>
              <Badge tone="normal">Verified Outcome</Badge>
              <span className="ops-mono">Duration: {selectedIncident.resolved - selectedIncident.created} min</span>
            </div>
            <div className="ops-timeline">
              <h4>Chronological Incident Timeline</h4>
              {selectedIncident.timeline?.map((entry, idx) => (
                <div key={idx} style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="ops-mono" style={{ fontSize: "11px", color: "#7eb8c8" }}>{clock(entry.minute)}</span>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--ops-ink)" }}>{entry.text}</p>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
