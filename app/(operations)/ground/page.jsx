"use client";
import { useState } from "react";
import { useOperations } from "@/components/operations/OperationsProvider";
import {
  Badge,
  Heading,
  Loading,
  Panel,
  Progress,
} from "@/components/operations/UI";
import VenueMap from "@/components/operations/VenueMap";
import { TaskList } from "@/components/operations/IncidentResponse";

export default function Ground() {
  const { state } = useOperations();
  const [selected, select] = useState("west");
  if (!state) return <Loading />;
  const total = state.personnel.reduce((sum, p) => sum + p.total, 0),
    deployed = state.personnel.reduce((sum, p) => sum + p.deployed, 0);
  const tasks = state.tasks.filter(
    (t) => t.team === "ground" && t.status !== "completed",
  );

  return (
    <>
      <Heading
        title="Ground Operations"
        code="03 / RESPONSE"
        description="Personnel coordination, field assignments, and verified task completion."
      >
        <Badge>Ground team / demo role</Badge>
      </Heading>

      {/* TASK HERO — above the fold, first thing the field worker sees */}
      <div className="ops-task-hero">
        <Panel
          title="Active tasks &amp; dispatch"
          meta={tasks.length ? `${tasks.length} IN FLIGHT` : "NO ACTIVE TASKS"}
        >
          <TaskList team="ground" />
        </Panel>
      </div>

      {/* Secondary reference — map, staffing, sequence note */}
      <div className="ops-secondary-details">
        <div className="ops-map-column">
          <VenueMap
            state={state}
            selected={selected}
            onSelect={select}
            mode="ground"
          />
          <Panel
            title="Force capacity breakdown"
            meta="RESOURCES RESERVED AT DISPATCH"
          >
            <div className="ops-resource-grid">
              {state.personnel.map((p) => (
                <div key={p.id}>
                  <div className="ops-row">
                    <h3>{p.name}</h3>
                    <span className="ops-mono">
                      {p.deployed} / {p.total}
                    </span>
                  </div>
                  <Progress value={(p.deployed / p.total) * 100} />
                  <span className="ops-mono">
                    {p.total - p.deployed} available · {p.deployed} deployed /
                    reserved
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <aside className="ops-rail">
          <Panel title="Force summary" meta="LIVE">
            <div className="ops-padded">
              <div className="ops-row">
                <span className="ops-kicker">Total force</span>
                <strong>{total} staff</strong>
              </div>
              <div className="ops-row" style={{ marginTop: 10 }}>
                <span className="ops-kicker">Deployed &amp; reserved</span>
                <strong>{deployed}</strong>
              </div>
              <div className="ops-row" style={{ marginTop: 10 }}>
                <span className="ops-kicker">Available</span>
                <strong className="normal">{total - deployed}</strong>
              </div>
            </div>
          </Panel>
          <div className="ops-note">
            <span className="ops-kicker">Operational sequence</span>
            <p>
              Accept the task → start deployment → mark complete. Flag an issue
              when your team needs executive support.
            </p>
            <p>
              Crowd stabilization begins when both ground and transport teams
              are in progress. Fire and medical incidents also require staff
              clearance in Incidents.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
