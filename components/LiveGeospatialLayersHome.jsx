// Fan-facing reference layers around DY Patil Stadium.
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
  const [mapError, setMapError] = useState(false);
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

          L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
          }).addTo(map);

          mapInstance.current = map;
          layerGroup.current = L.layerGroup().addTo(map);
          requestAnimationFrame(() => map.invalidateSize());
        }

        renderLayer(active);
      } catch (err) {
        console.error('Leaflet load error:', err);
        if (!isCancelled) setMapError(true);
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
      const color = g.side === 'local' ? '#fff' : '#b0b0b0';
      const icon = L.divIcon({
        className: 'custom-gate-pin',
        html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid #0b0b0b;box-shadow:0 0 0 2px #fff"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([g.lat, g.lng], { icon })
        .addTo(group)
        .bindPopup(`<strong>${g.name}</strong><br/>Reference entry point`);
    });

    if (layerKey === 'gate') {
      map.flyTo([STADIUM.lat, STADIUM.lng], 16, { duration: 1 });
    } else if (layerKey === 'hotel') {
      HOTELS.forEach((h) => {
        const icon = L.divIcon({
          className: 'custom-hotel-pin',
          html: '<div style="background:#ededed;padding:3px 6px;border:1px solid #111;color:#111;font-size:10px;font-weight:bold;white-space:nowrap">STAY</div>',
          iconSize: [46, 20],
        });
        L.marker([h.lat, h.lng], { icon })
          .addTo(group)
          .bindPopup(`<strong>${h.name}</strong><br/>Reference location · check availability with hotel`);
      });
      map.flyTo([19.055, 73.01], 13, { duration: 1.2 });
    } else if (layerKey === 'transit') {
      TRANSIT.forEach((seg) => {
        L.polyline(seg, { color: '#f1f1f1', weight: 4, opacity: 0.85 }).addTo(group);
      });
      map.flyTo([19.05, 73.015], 13, { duration: 1.2 });
    } else if (layerKey === 'shuttle') {
      SHUTTLE.forEach((seg) => {
        L.polyline(seg, { color: '#c5c5c5', weight: 4, opacity: 0.85, dashArray: '6, 8' }).addTo(group);
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
    <div className="fx-geo">
      <div className="fx-geo-header">
        <div>
          <p>VENUE / REFERENCE LAYERS</p>
          <h3>DY PATIL / NERUL</h3>
        </div>
        <div className="fx-geo-controls" role="group" aria-label="Map layers">
          {layerPills.map((pill) => (
            <button
              key={pill.key}
              type="button"
              aria-pressed={active === pill.key}
              onClick={() => setActive(pill.key)}
              className={active === pill.key ? 'fx-geo-active' : ''}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      <div className="fx-geo-map">
        {mapError ? (
          <div className="fx-geo-placeholder" role="alert">Map could not load. <a href="https://www.openstreetmap.org/?mlat=19.04194&mlon=73.02667#map=16/19.04194/73.02667" target="_blank" rel="noreferrer">Open venue in OpenStreetMap</a></div>
        ) : !mounted ? (
          <div className="fx-geo-placeholder" role="status">Loading venue map…</div>
        ) : (
          <div ref={mapRef} className="map-dark-tiles h-full w-full" />
        )}
      </div>
      <p className="fx-geo-note">© OpenStreetMap contributors <span>Illustrative layers · confirm routes with event staff</span></p>
    </div>
  );
}
