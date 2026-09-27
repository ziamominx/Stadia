"use client";
import { useEffect, useRef } from "react";

const offsets = { north: [0.0017, 0], east: [0, 0.0021], south: [-0.0017, 0], west: [0, -0.0021] };
export default function GeoVenueMap({ state, selected, onSelect }) {
  const container = useRef(null);
  const map = useRef(null);
  const markers = useRef(null);
  useEffect(() => {
    let active = true;
    let observer;
    import("leaflet").then(({ default: L }) => {
      if (!active || !container.current) return;
      const center = [state.event.lat || 19.033, state.event.lng || 73.0297];
      map.current = L.map(container.current, { scrollWheelZoom: false }).setView(center, 16);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19, subdomains: "abcd", attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
      }).addTo(map.current);
      markers.current = L.layerGroup().addTo(map.current);
      L.circleMarker(center, { radius: 9, color: "#fff", fillColor: "#171717", fillOpacity: 1, weight: 3 })
        .addTo(markers.current).bindTooltip(state.event.venue);
      observer = new ResizeObserver(() => map.current?.invalidateSize({ pan: false }));
      observer.observe(container.current);
      requestAnimationFrame(() => map.current?.invalidateSize({ pan: false }));
      draw(L);
    });
    function draw(L) {
      if (!markers.current) return;
      markers.current.clearLayers();
      const center = [state.event.lat || 19.033, state.event.lng || 73.0297];
      L.circleMarker(center, { radius: 9, color: "#fff", fillColor: "#171717", fillOpacity: 1, weight: 3 }).addTo(markers.current).bindTooltip(state.event.venue);
      for (const zone of state.zones) {
        const offset = offsets[zone.id];
        if (!offset) continue;
        const color = zone.fire || zone.occupancy >= state.rules.critical ? "#ff8d90" : zone.occupancy >= state.rules.warning ? "#f2b960" : "#6cd0aa";
        const marker = L.circleMarker([center[0] + offset[0], center[1] + offset[1]], { radius: selected === zone.id ? 13 : 10, color: "#fff", fillColor: color, fillOpacity: .95, weight: selected === zone.id ? 3 : 2 }).addTo(markers.current);
        marker.bindTooltip(`${zone.name}: ${zone.occupancy}% (simulated)`);
        marker.on("click", () => onSelect?.(zone.id));
      }
    }
    return () => { active = false; observer?.disconnect(); map.current?.remove(); map.current = null; markers.current = null; };
  }, []);
  useEffect(() => {
    if (!map.current || !markers.current) return;
    import("leaflet").then(({ default: L }) => {
      if (!markers.current) return;
      markers.current.clearLayers();
      const center = [state.event.lat || 19.033, state.event.lng || 73.0297];
      L.circleMarker(center, { radius: 9, color: "#fff", fillColor: "#171717", fillOpacity: 1, weight: 3 }).addTo(markers.current).bindTooltip(state.event.venue);
      for (const zone of state.zones) {
        const offset = offsets[zone.id];
        if (!offset) continue;
        const color = zone.fire || zone.occupancy >= state.rules.critical ? "#ff8d90" : zone.occupancy >= state.rules.warning ? "#f2b960" : "#6cd0aa";
        L.circleMarker([center[0] + offset[0], center[1] + offset[1]], { radius: selected === zone.id ? 13 : 10, color: "#fff", fillColor: color, fillOpacity: .95, weight: selected === zone.id ? 3 : 2 }).addTo(markers.current).bindTooltip(`${zone.name}: ${zone.occupancy}% (simulated)`).on("click", () => onSelect?.(zone.id));
      }
    });
  }, [state, selected, onSelect]);
  useEffect(() => {
    map.current?.setView([state.event.lat || 19.033, state.event.lng || 73.0297], map.current.getZoom(), { animate: false });
  }, [state.event.lat, state.event.lng]);
  return <div className="ops-geo-wrap"><div ref={container} className="ops-geo-map" role="application" aria-label="OpenStreetMap venue location and approximate simulated gate markers" /><p>Live OpenStreetMap/CARTO base tiles · Gate pins are approximate and occupancy values are simulated.</p></div>;
}
