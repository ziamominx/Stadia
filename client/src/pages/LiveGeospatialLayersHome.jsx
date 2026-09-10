import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApi, api } from '../api.js';

const LAYER_COLORS = {
  hotel: '#f59e0b',
  gate: '#38bdf8',
  transit: '#38bdf8',
  shuttle: '#fb7185',
};

export default function LiveGeospatialLayersHome() {
  const [active, setActive] = useState('gate');
  const mapRef = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (mapRef.current || !L) return;
    const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false });
    map.setView([19.0583, 73.0075], 12);
    mapRef.current = map;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.invalidateSize();
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Hotel dots
  useEffect(() => {
    if (!mapRef.current || active !== 'hotel') return;
    const map = mapRef.current;
    const group = L.layerGroup().addTo(map);
    locationData.hotels.forEach((h) => {
      const icon = L.divIcon({
        className: 'hotel-marker',
        html: `<div style="background:${LAYER_COLORS.hotel};width:18px;height:18px;border-radius:9999px;border:2px solid #fff;box-shadow:0 0 8px rgba(0,0,0,.55)"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      L.marker([h.lat, h.lng], { icon }).addTo(group).bindPopup(`
        <strong>${h.name}</strong><br/>
        <span style="color:#94a3b8">${h.nights} nights · ₹${h.rate.toLocaleString('en-IN')}</span>
      `);
    });
    map.invalidateSize();
    return () => map.removeLayer(group);
  }, [active]);

  // Gate dots + stadium\r
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (!locationData) return;
    const group = L.layerGroup().addTo(map);
    const pts = [locationData.stadium];
    locationData.gates.forEach((g) => {
      const pts2 = [g.lat, g.lng];
      pts.push(pts2);
      const color = LAYER_COLORS.gate;
      const icon = L.divIcon({
        className: 'gate-marker',
        html: `<div style="background:${color};width:20px;height:20px;border-radius:9999px;border:2px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.5)"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      L.marker(pts2, { icon }).addTo(group).bindPopup(`
        <strong>${g.name}</strong><br/>
        <span style="color:#94a3b8">${g.side} · ${g.side === 'local' ? 'North/West' : 'East/South'}</span>
      `);
    });
    map.fitBounds(L.latLngBounds(pts).pad(0.25));
    map.invalidateSize();
    return () => map.removeLayer(group);
  }, [active]);

  // Transit corridors\r
  useEffect(() => {
    if (!mapRef.current || active !== 'transit') return;
    const map = mapRef.current;
    const group = L.layerGroup().addTo(map);
    locationData.transit.forEach((seg) =>
      L.polyline(seg, { color: LAYER_COLORS.transit, weight: 3, opacity: 0.85 }).addTo(group),
    );
    map.fitBounds(L.latLngBounds([...locationData.transit.flat()]).pad(0.2));
    map.invalidateSize();
    return () => map.removeLayer(group);
  }, [active]);

  // Shuttle corridors\r
  useEffect(() => {
    if (!mapRef.current || active !== 'shuttle') return;
    const map = mapRef.current;
    const group = L.layerGroup().addTo(map);
    locationData.shuttle.forEach((seg) =>
      L.polyline(seg, { color: LAYER_COLORS.shuttle, weight: 3, opacity: 0.85, dashArray: '6 6' }).addTo(group),
    );
    map.fitBounds(L.latLngBounds([...locationData.shuttle.flat()]).pad(0.2));
    map.invalidateSize();
    return () => map.removeLayer(group);
  }, [active]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-cyber-400">Live geospatial layers</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">The stadium, live on the map</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Eight gates, the two visitor corridors and every partner hotel and shuttle route — all on one map, updated live from every ticket booked today.
          </p>
        </div>
        <span className="chip border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
          <span className="live-dot" /> Live
        </span>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/40">
        <div ref={mapRef} className="map-dark-tiles relative h-[420px] w-full overflow-hidden rounded-2xl" />

        {/* layer toggle pills — matches the navbar toggle style */}
        <div className="pointer-events-auto absolute top-3 right-3 flex flex-wrap gap-2">
          {[
            { key: 'gate', label: '🏟️ Gates' },
            { key: 'hotel', label: '🏨 Hotels' },
            { key: 'transit', label: '🚆 Transit' },
            { key: 'shuttle', label: '🚌 Shuttles' },
          ].map((layer) => (
            <button
              key={layer.key}
              onClick={() => setActive(layer.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                active === layer.key
                  ? 'bg-gradient-to-r from-cyber-500 to-volt-500 text-ink-950'
                  : 'border-white/15 bg-white/[0.03] text-slate-400 hover:text-white'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Static location data (in-tree, small, so the map renders before any API round-trip) ----
const locationData = {
  stadium: { lat: 19.0583, lng: 73.0075 },
  gates: [
    { name: 'Gate A · North', lat: 19.0601, lng: 73.0075, side: 'local' },
    { name: 'Gate B · North-East', lat: 19.0599, lng: 73.0092, side: 'local' },
    { name: 'Gate C · East', lat: 19.0583, lng: 73.0097, side: 'outstation' },
    { name: 'Gate D · South-East', lat: 19.0567, lng: 73.0092, side: 'outstation' },
    { name: 'Gate E · South', lat: 19.0565, lng: 73.0075, side: 'outstation' },
    { name: 'Gate F · South-West', lat: 19.0567, lng: 73.0058, side: 'outstation' },
    { name: 'Gate G · West', lat: 19.0583, lng: 73.0053, side: 'local' },
    { name: 'Gate H · North-West', lat: 19.0599, lng: 73.0058, side: 'local' },
  ],
  hotels: [
    { name: 'The Grand Vashi', lat: 19.0757, lng: 72.9984, nights: 2, rate: 18000 },
    { name: 'Hotel Orchid Vashi', lat: 19.0793, lng: 72.9988, nights: 2, rate: 12000 },
    { name: 'Radisson Blu Belapur', lat: 19.0317, lng: 73.0364, nights: 2, rate: 20000 },
    { name: 'Fortune Select Seawoods', lat: 19.04, lng: 73.01, nights: 2, rate: 13000 },
    { name: 'Novotel Mumbai (Nerul)', lat: 19.0349, lng: 73.0198, nights: 2, rate: 16500 },
    { name: 'Taj Santacruz (Airport)', lat: 19.0957, lng: 72.8711, nights: 2, rate: 22000 },
  ],
  transit: [
    [
      [19.0317, 73.0364],
      [19.045, 73.028],
      [19.0583, 73.018],
      [19.0583, 73.0097],
    ],
    [
      [19.0618, 73.008],
      [19.0601, 73.0075],
    ],
  ],
  shuttle: [
    [
      [19.0317, 73.0364],
      [19.045, 73.028],
      [19.0583, 73.018],
      [19.0583, 73.0097],
    ],
    [
      [19.0349, 73.0198],
      [19.048, 73.014],
      [19.0567, 73.0092],
    ],
  ],
};
