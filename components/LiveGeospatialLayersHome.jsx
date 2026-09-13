// components/LiveGeospatialLayersHome.jsx — Dynamic Geospatial Layers for Next.js
'use client';

import React, { useState, useEffect, useRef } from 'react';

const STADIUM = { lat: 19.04194, lng: 73.02667 };

const GATES = [
  { name: 'Gate A · North', lat: 19.04339, lng: 73.02667, side: 'local' },
  { name: 'Gate B · North-East', lat: 19.04296, lng: 73.02775, side: 'local' },
  { name: 'Gate C · East', lat: 19.04194, lng: 73.0282, side: 'outstation' },
  { name: 'Gate D · South-East', lat: 19.04092, lng: 73.02775, side: 'outstation' },
  { name: 'Gate E · South', lat: 19.04049, lng: 73.02667, side: 'outstation' },
  { name: 'Gate F · South-West', lat: 19.04092, lng: 73.02559, side: 'outstation' },
  { name: 'Gate G · West', lat: 19.04194, lng: 73.02514, side: 'local' },
  { name: 'Gate H · North-West', lat: 19.04296, lng: 73.02559, side: 'local' },
];

const HOTELS = [
  { name: 'The Grand Vashi', lat: 19.0757, lng: 72.9984, rate: 18000, nights: 2 },
  { name: 'Radisson Blu Belapur', lat: 19.0317, lng: 73.0364, rate: 20000, nights: 2 },
  { name: 'Fortune Select Seawoods', lat: 19.04, lng: 73.01, rate: 13000, nights: 1 },
  { name: 'Novotel Mumbai (Nerul)', lat: 19.0349, lng: 73.0198, rate: 16500, nights: 2 },
];

const TRANSIT = [
  [[19.0757, 72.9984], [19.0445, 73.015], [19.04339, 73.02667]],
  [[19.0317, 73.0364], [19.038, 73.03], [19.04092, 73.02775]],
];

const SHUTTLE = [
  [[19.0957, 72.8711], [19.06, 72.95], [19.04194, 73.0282]],
  [[19.0793, 72.9988], [19.055, 73.01], [19.04049, 73.02667]],
];

export default function LiveGeospatialLayersHome() {
  const [active, setActive] = useState('gate');
  const [mounted, setMounted] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layerGroup = useRef(null);
  const LRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapRef.current) return;
    let isCancelled = false;

    async function setupMap() {
      try {
        const L = (await import('leaflet')).default;
        if (isCancelled || !mapRef.current) return;
        LRef.current = L;

        if (!mapInstance.current) {
          const map = L.map(mapRef.current, {
            zoomControl: true,
            scrollWheelZoom: false,
          }).setView([STADIUM.lat, STADIUM.lng], 16);

          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap &copy; CARTO',
          }).addTo(map);

          mapInstance.current = map;
          layerGroup.current = L.layerGroup().addTo(map);
        }

        renderLayer(active);
      } catch (err) {
        console.error('Leaflet load error:', err);
      }
    }

    setupMap();

    return () => {
      isCancelled = true;
    };
  }, [mounted]);

  useEffect(() => {
    if (mapInstance.current && LRef.current) {
      renderLayer(active);
    }
  }, [active]);

  function renderLayer(layerKey) {
    const L = LRef.current;
    const map = mapInstance.current;
    const group = layerGroup.current;
    if (!L || !map || !group) return;

    group.clearLayers();

    // Always draw gates
    GATES.forEach((g) => {
      const color = g.side === 'local' ? '#38bdf8' : '#fb7185';
      const icon = L.divIcon({
        className: 'custom-gate-pin',
        html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid #ffffff;box-shadow:0 0 10px ${color}"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([g.lat, g.lng], { icon })
        .addTo(group)
        .bindPopup(`<strong>${g.name}</strong><br/>Corridor: ${g.side.toUpperCase()}`);
    });

    if (layerKey === 'gate') {
      map.flyTo([STADIUM.lat, STADIUM.lng], 16, { duration: 1 });
    } else if (layerKey === 'hotel') {
      HOTELS.forEach((h) => {
        const icon = L.divIcon({
          className: 'custom-hotel-pin',
          html: `<div style="background:#f59e0b;padding:3px 6px;border-radius:6px;border:1px solid #fff;color:#000;font-size:10px;font-weight:bold;box-shadow:0 0 8px #f59e0b">₹${h.rate / 1000}k</div>`,
          iconSize: [50, 20],
        });
        L.marker([h.lat, h.lng], { icon })
          .addTo(group)
          .bindPopup(`<strong>${h.name}</strong><br/>Rate: ₹${h.rate.toLocaleString('en-IN')}`);
      });
      map.flyTo([19.055, 73.01], 13, { duration: 1.2 });
    } else if (layerKey === 'transit') {
      TRANSIT.forEach((seg) => {
        L.polyline(seg, { color: '#00e5ff', weight: 4, opacity: 0.85 }).addTo(group);
      });
      map.flyTo([19.05, 73.015], 13, { duration: 1.2 });
    } else if (layerKey === 'shuttle') {
      SHUTTLE.forEach((seg) => {
        L.polyline(seg, { color: '#10b981', weight: 4, opacity: 0.85, dashArray: '6, 8' }).addTo(group);
      });
      map.flyTo([19.06, 72.95], 12, { duration: 1.2 });
    }
  }

  const layerPills = [
    { key: 'gate', label: 'Gates' },
    { key: 'hotel', label: 'Hotels' },
    { key: 'transit', label: 'Transit' },
    { key: 'shuttle', label: 'Shuttles' },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-neutral-800/80 bg-[#0e0e12] p-6 shadow-2xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 font-mono">Live Geospatial Layers</p>
          <h3 className="text-xl font-black text-white">Interactive Venue & Corridor Radar</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {layerPills.map((pill) => (
            <button
              key={pill.key}
              onClick={() => setActive(pill.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                active === pill.key
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'border border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[380px] w-full overflow-hidden rounded-xl border border-neutral-800">
        {!mounted ? (
          <div className="flex h-full w-full items-center justify-center bg-[#09090b] text-xs text-neutral-500">
            Initializing satellite radar...
          </div>
        ) : (
          <div ref={mapRef} className="h-full w-full" />
        )}
      </div>
    </div>
  );
}
