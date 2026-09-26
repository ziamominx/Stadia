"use client";
import { useState } from "react";
import { useOperations } from "./OperationsProvider";
import { Button, Empty, Panel } from "./UI";
export default function EmergencyRoutes() {
  const { state, send, busy } = useOperations();
  const [incidentId, setIncident] = useState(""),
    [exitId, setExit] = useState(""),
    [instructions, setInstructions] = useState(""),
    [verified, setVerified] = useState(false);
  const incidents = state.incidents.filter(
    (i) => i.type === "fire" && i.status !== "resolved",
  );
  const exits = state.exits.filter(
    (e) =>
      e.status === "available" &&
      !state.zones.find((z) => z.id === e.zone).fire,
  );
  return (
    <Panel
      title="Staff-approved emergency routes"
      meta="MANUAL VERIFICATION REQUIRED"
    >
      {!incidents.length ? (
        <Empty title="No active fire alerts">
          After a fire report, staff can verify an available alternate exit and
          record instructions here.
        </Empty>
      ) : (
        <form
          className="ops-padded"
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              await send(
                {
                  type: "route",
                  id: incidentId || incidents[0]?.id,
                  exitId: exitId || exits[0]?.id,
                  instructions,
                  verified,
                },
                "Staff-approved route published to incident responders.",
              )
            ) {
              setVerified(false);
              setInstructions("");
            }
          }}
        >
          <div className="ops-config-grid">
            <label className="ops-field">
              Affected incident
              <select
                value={incidentId || incidents[0]?.id}
                onChange={(e) => setIncident(e.target.value)}
              >
                {incidents.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="ops-field">
              Verified alternate exit
              <select
                value={exitId || exits[0]?.id || ""}
                onChange={(e) => setExit(e.target.value)}
              >
                {!exits.length && <option value="">No exits available</option>}
                {exits.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="ops-field">
            Staff-provided route instructions
            <textarea
              required
              minLength={5}
              maxLength={240}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Record the route and directions verified by venue staff."
            />
          </label>
          <label className="ops-check">
            <input
              type="checkbox"
              required
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
            />{" "}
            Staff have verified this route and exit in the simulation.
          </label>
          <Button
            variant="primary"
            disabled={
              busy ||
              !verified ||
              !exits.length ||
              instructions.trim().length < 5
            }
          >
            Publish approved route
          </Button>
        </form>
      )}
    </Panel>
  );
}
