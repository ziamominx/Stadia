"use client";

import { useState } from "react";
import Link from "next/link";
import { useOperations } from "@/components/operations/OperationsProvider";
import { Badge, Heading, Loading, Panel } from "@/components/operations/UI";
import VenueMap from "@/components/operations/VenueMap";

export default function StreetMapPage() {
  const { state } = useOperations();
  const [selected, setSelected] = useState("west");
  if (!state) return <Loading />;
  return <>
    <Heading title="Street Map" code="03 / GEOSPATIAL" description="Explore stadium gates, parking, hotels and approach corridors around the event venue.">
      <Badge>OpenStreetMap tiles</Badge>
    </Heading>
    <div className="ops-note"><p>Street tiles reflect real map geography. Gate positions, partner sites and route corridors are reference locations; crowd loads and vehicle activity come from the simulation.</p></div>
    <div className="ops-dedicated-map ops-dedicated-street"><VenueMap state={state} selected={selected} onSelect={setSelected} initialView="street" lockedView="street" /></div>
    <div className="ops-map-page-insights">
      <Panel title="Map layers" meta="SELECT ABOVE THE MAP">
        <div className="ops-padded"><p>Gates reveal simulated sector conditions. Parking and hotel layers show reference sites. Transit and shuttle layers show indicative corridors without live vehicle GPS.</p></div>
      </Panel>
      <Panel title="Related operations" meta="SHARED EVENT STATE">
        <div className="ops-map-page-links"><Link href="/stadium">Inspect stadium schematic ↗</Link><Link href="/transport">Review fleet and parking ↗</Link><Link href="/hospitality">Review partner accommodation ↗</Link></div>
      </Panel>
    </div>
  </>;
}
