"use client";
import { useOperations } from "@/components/operations/OperationsProvider";
import {
  Badge,
  Empty,
  Heading,
  Loading,
  Metrics,
  Panel,
  Sparkline,
  clock,
} from "@/components/operations/UI";
export default function Analytics() {
  const { state } = useOperations();
  if (!state) return <Loading />;
  const closed = state.incidents.filter((i) => i.status === "resolved");
  const avg = closed.length
    ? (
        closed.reduce((n, i) => n + i.resolved - i.created, 0) / closed.length
      ).toFixed(1)
    : "—";
  return (
    <>
      <Heading
        title="Response Analytics"
        code="07 / OUTCOMES"
        description="Measured incident outcomes from this shared demo session."
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
            label: "Tasks completed",
            value: state.tasks.filter((t) => t.status === "completed").length,
            detail: "Ground and transport responses",
          },
        ]}
      />
      <Panel title="Incident outcomes" meta="CURRENT SESSION">
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
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {closed.map((i) => (
                  <tr key={i.id}>
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
                      <Badge>Verified</Badge>
                    </td>
                  </tr>
                ))}
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
        <Panel title="Zone occupancy history" meta="MOST RECENT 20 READINGS">
          <div className="ops-resource-grid">
            {state.zones.map((z) => (
              <div key={z.id}>
                <div className="ops-row">
                  <h3>{z.name}</h3>
                  <strong>{z.occupancy}%</strong>
                </div>
                <Sparkline values={z.history} />
              </div>
            ))}
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
    </>
  );
}
