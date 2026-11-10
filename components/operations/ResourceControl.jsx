"use client";
import { useState } from "react";
import { useOperations } from "./OperationsProvider";
import { Button } from "./UI";
function ResourceRow({ resource }) {
  const { send, busy } = useOperations();
  const [total, setTotal] = useState(resource.total);
  return (
    <form
      className="ops-exit-row"
      onSubmit={(e) => {
        e.preventDefault();
        send(
          { type: "resource", id: resource.id, total },
          "Personnel roster updated.",
        );
      }}
    >
      <div>
        <strong>{resource.name}</strong>
        <span className="ops-mono">
          {resource.deployed} DEPLOYED · {resource.total - resource.deployed}{" "}
          AVAILABLE
        </span>
      </div>
      <div className="ops-resource-input">
        <input
          aria-label={`${resource.name} roster total`}
          type="number"
          min={resource.deployed}
          max={2000}
          step={1}
          required
          value={total}
          onChange={(e) => setTotal(e.target.value)}
        />
        <Button disabled={busy || Number(total) === resource.total}>
          Save
        </Button>
      </div>
    </form>
  );
}
export default function ResourceControl() {
  const { state } = useOperations();
  return state.personnel.map((p) => (
    <ResourceRow key={`${p.id}-${p.total}`} resource={p} />
  ));
}
