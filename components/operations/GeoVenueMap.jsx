"use client";

import { useEffect, useRef, useState } from "react";
import { gateStatus } from "@/lib/operations/engine.mjs";
import { DY_PATIL, STADIUM_GATES, STADIUM_HOTELS, STADIUM_PARKING, STADIUM_SHUTTLES, STADIUM_TRANSIT, gateCoordinates, isDyPatilVenue } from "@/lib/operations/dy-patil.mjs";

const tone = (status) => status === "critical" ? "#ff8d90" : status === "attention" ? "#f2b960" : "#e7e7e7";

export default function GeoVenueMap({ state, selected, onSelect, layer = "gates", onGateFocus }) {
  const container = useRef(null);
  const map = useRef(null);
  const markers = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const lat = Number(state.event.lat) || DY_PATIL.lat;
  const lng = Number(state.event.lng) || DY_PATIL.lng;
  const dyPatil = isDyPatilVenue(lat, lng);

  useEffect(() => {
    let active = true;
    let observer;
    import("leaflet").then(({ default: L }) => {
      if (!active || !container.current) return;
      map.current = L.map(container.current, { scrollWheelZoom: false, zoomControl: true }).setView([lat, lng], 17);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
      }).on("tileerror", () => setError("Map tiles are unavailable; check your internet connection.")).addTo(map.current);
      markers.current = L.layerGroup().addTo(map.current);
      observer = new ResizeObserver(() => map.current?.invalidateSize({ pan: false }));
      observer.observe(container.current);
      requestAnimationFrame(() => map.current?.invalidateSize({ pan: false }));
      setReady(true);
    }).catch(() => setError("The street map could not load."));
    return () => { active = false; observer?.disconnect(); map.current?.remove(); map.current = null; markers.current = null; };
    // Initialize Leaflet once; later effects update the shared event position and layers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || !map.current || !markers.current) return;
    let active = true;
    import("leaflet").then(({ default: L }) => {
      if (!active || !markers.current) return;
      markers.current.clearLayers();
      const center = [lat, lng];
      L.circleMarker(center, { radius: 10, color: "#fff", fillColor: "#111", fillOpacity: 1, weight: 3 })
        .addTo(markers.current).bindTooltip(dyPatil ? DY_PATIL.name : state.event.venue);
      for (const gate of STADIUM_GATES) {
        const zone = state.zones.find((item) => item.id === gate.zoneId);
        const coords = gateCoordinates(gate, lat, lng);
        const status = zone ? gateStatus(zone, state.rules) : "normal";
        L.circleMarker([coords.lat, coords.lng], {
          radius: selected === gate.zoneId ? 12 : 9,
          color: selected === gate.zoneId ? "#fff" : gate.corridor === "local" ? "#60a5b7" : "#bc8395",
          fillColor: tone(status), fillOpacity: .92, weight: selected === gate.zoneId ? 3 : 2,
        }).addTo(markers.current)
          .bindTooltip(`Gate ${gate.id} · ${gate.name} · ${gate.corridor} corridor<br>${zone?.occupancy ?? 0}% simulated sector occupancy · ${zone?.queue ?? 0} waiting`)
          .on("click", () => { onGateFocus?.(gate.id); onSelect?.(gate.zoneId); });
      }
      if (!dyPatil) return;
      if (layer === "parking") {
        for (const site of STADIUM_PARKING) {
          L.circleMarker([site.lat, site.lng], { radius: 7, color: "#fff", fillColor: "#9ca3af", fillOpacity: .9, weight: 2 })
            .addTo(markers.current).bindTooltip(`${site.id} · ${site.name}<br>Reference location`);
        }
      }
      if (layer === "hotels") {
        for (const hotel of STADIUM_HOTELS) {
          L.circleMarker([hotel.lat, hotel.lng], { radius: 7, color: "#fff", fillColor: "#f2b960", fillOpacity: .9, weight: 2 })
            .addTo(markers.current).bindTooltip(`${hotel.name}<br>Reference partner location`);
        }
      }
      if (layer === "transit" || layer === "shuttles") {
        const routes = layer === "transit" ? STADIUM_TRANSIT : STADIUM_SHUTTLES;
        for (const route of routes) {
          L.polyline(route.points, { color: layer === "transit" ? "#60a5b7" : "#bc8395", weight: 4, opacity: .85, dashArray: layer === "shuttles" ? "8 6" : undefined })
            .addTo(markers.current).bindTooltip(`${route.name}<br>Reference corridor; vehicle position is not live`);
        }
      }
    }).catch(() => setError("The map markers could not load."));
    return () => { active = false; };
  }, [ready, state, selected, layer, onSelect, onGateFocus, lat, lng, dyPatil]);

  useEffect(() => {
    if (!ready || !map.current) return;
    let active = true;
    import("leaflet").then(({ default: L }) => {
      if (!active || !map.current) return;
      const gatePoints = STADIUM_GATES.map((gate) => {
        const coords = gateCoordinates(gate, lat, lng);
        return [coords.lat, coords.lng];
      });
      const extras = !dyPatil ? [] : layer === "parking" ? STADIUM_PARKING.map((site) => [site.lat, site.lng])
        : layer === "hotels" ? STADIUM_HOTELS.map((hotel) => [hotel.lat, hotel.lng])
          : layer === "transit" ? STADIUM_TRANSIT.flatMap((route) => route.points)
            : layer === "shuttles" ? STADIUM_SHUTTLES.flatMap((route) => route.points) : [];
      map.current.fitBounds(L.latLngBounds([...gatePoints, ...extras]).pad(.18), { maxZoom: 17, animate: false });
      map.current.invalidateSize({ pan: false });
    });
    return () => { active = false; };
  }, [ready, layer, lat, lng, dyPatil]);

  return <div className="ops-geo-wrap">
    <div ref={container} className="ops-geo-map" role="application" aria-label="Street map of the venue with eight selectable stadium gates and reference layers" />
    {error && <div className="ops-geo-error" role="status">{error}</div>}
    <p>OpenStreetMap/CARTO tiles · Gates A–H use DY Patil reference positions · Gate load is four-sector simulation · {dyPatil ? "Parking, hotel and route locations are reference data." : "Off-site landmarks are hidden for this venue."}</p>
  </div>;
}
