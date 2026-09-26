"use client";
import { useState } from "react";
import { useOperations } from "@/components/operations/OperationsProvider";
import {
  Badge,
  Heading,
  Loading,
  Metrics,
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
      <Metrics
        items={[
          {
            label: "Total force",
            value: total,
            unit: "staff",
            detail: "Five resource categories",
          },
          {
            label: "Deployed & reserved",
            value: deployed,
            detail: "Includes pending response assignments",
          },
          {
            label: "Available",
            value: total - deployed,
            detail: "Ready for executive dispatch",
            tone: "normal",
          },
          {
            label: "Active tasks",
            value: tasks.length,
            detail: `${tasks.filter((t) => t.flagged).length} flagged for support`,
            tone: tasks.length ? "attention" : "",
          },
        ]}
      />
      <div className="ops-workspace">
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
          <Panel
            title="Active tasks & dispatch"
            meta={`${tasks.length} IN FLIGHT`}
          >
            <TaskList team="ground" />
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
