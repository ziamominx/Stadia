import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LAYER_COLORS = {
  hotel: '#f59e0b',
  gate: '#38bdf8',
  transit: '#38bdf8',
  shuttle: '#fb7185',
};

// Real DY Patil Stadium, Nerul: 19.04194°N, 73.02667°E.
const STADIUM = { lat: 19.04194, lng: 73.02667 };

// Gates hug the stadium bowl (~160 m ring) so they sit on the venue, not the roads.
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
  { name: 'Lemon Tree Nerul', lat: 19.0439, lng: 73.0189, nights: 2, rate: 11500 },
  { name: 'Fortune Select Seawoods', lat: 19.04, lng: 73.01, nights: 2, rate: 13000 },
  { name: 'Novotel Mumbai (Nerul)', lat: 19.0349, lng: 73.0198, nights: 2, rate: 16500 },
  { name: 'Radisson Blu Belapur', lat: 19.0317, lng: 73.0364, nights: 2, rate: 20000 },
  { name: 'The Grand Vashi', lat: 19.0757, lng: 72.9984, nights: 2, rate: 18000 },
  { name: 'Hotel Orchid Vashi', lat: 19.0793, lng: 72.9988, nights: 2, rate: 12000 },
];

const TRANSIT = [
  // Nerul Station → Gate A concourse
  [[19.0473, 73.0262], [19.0456, 73.0264], [19.04339, 73.02667]],
  // Belapur Metro feeder → Gate C (East drop)
  [[19.0317, 73.0364], [19.0352, 73.0312], [19.0388, 73.0293], [19.04194, 73.0282]],
];

const SHUTTLE = [
  // Seawoods drop → Gate E (South)
  [[19.04, 73.01], [19.0403, 73.018], [19.04049, 73.02667]],
  // Belapur shuttle → Gate D (South-East)
  [[19.0317, 73.0364], [19.036, 73.032], [19.04092, 73.02775]],
];

// Ellipse radii of the gate ring in degrees (≈160 m lat / 170 m lng).
const RING = { lat: 0.00145, lng: 0.00153 };

function makeIcon(color, size, anchor, glyph) {
  const html = glyph
    ? `<div style="background:${color};width:${size}px;height:${size}px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:${Math.round(size * 0.5)}px;border:2px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.5)">${glyph}</div>`
    : `<div style="background:${color};width:${size}px;height:${size}px;border-radius:9999px;border:2px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.5)"></div>`;
  return L.divIcon({
    className: '',
    html,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
  });
}

export default function LiveGeospatialLayersHome() {
  const [active, setActive] = useState('gate');
  const [mapError, setMapError] = useState(null);
  const mapRef = useRef(null); // DOM node
  const map = useRef(null); // L.map instance

  const safeSetError = useCallback((err) => {
    setMapError(err && err.message ? err.message : 'Leaflet map error');
  }, []);

  const initMap = useCallback(() => {
    if (!mapRef.current) return null;
    try {
      const m = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false,
        zoomSnap: 0.25,
      });
      // Stadium-only view: fixed tight zoom on the venue bowl itself.
      m.setView([STADIUM.lat, STADIUM.lng], 18);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(m);
      m.invalidateSize();
      map.current = m;
      return m;
    } catch (err) {
      safeSetError(err);
      map.current = null;
      return null;
    }
  }, [safeSetError]);

  useEffect(() => {
    const m = initMap();
    // Keep the map locked to its container through any late layout/resizes.
    let ro;
    if (m) {
      ro = new ResizeObserver(() => {
        try { m.invalidateSize({ pan: false }); } catch {}
      });
      ro.observe(mapRef.current);
    }
    return () => {
      if (ro) ro.disconnect();
      if (m) {
        try { m.remove(); } catch {}
        map.current = null;
      }
    };
  }, [initMap]);

  // Gates: ALWAYS-ON base layer. Never hidden by layer toggles — every other
  // layer renders on top of them and map framing always includes them.
  useEffect(() => {
    if (!map.current || mapError) return;
    const m = map.current;
    try {
      const group = L.layerGroup().addTo(m);
      GATES.forEach((g) => {
        L.marker([g.lat, g.lng], { icon: makeIcon(LAYER_COLORS.gate, 24, 12), zIndexOffset: 1000 })
          .addTo(group)
          .bindPopup(
            `<strong>${g.name}</strong><br/><span style="color:#94a3b8">${g.side} corridor · ${g.side === 'local' ? 'North/West' : 'East/South'}</span>`,
          );
      });
      m.invalidateSize();
      return () => { try { m.removeLayer(group); } catch {} };
    } catch (err) {
      safeSetError(err);
    }
  }, [mapError, safeSetError]);

  // Helper: frame the gates plus the active layer's points together. Because
  // the gate ring is always inside the fitted bounds, the stadium gates stay
  // visible no matter how far the layer spreads (hotels reach Vashi/Belapur).
  // maxZoom only caps how far in it zooms — it never excludes points.
  const fitToLayer = useCallback((points, pad = 0.25) => {
    const m = map.current;
    if (!m || mapError) return;
    const all = [...GATES.map((g) => [g.lat, g.lng]), ...points];
    try {
      m.fitBounds(L.latLngBounds(all).pad(pad), { maxZoom: 15 });
      m.invalidateSize();
    } catch (err) {
      safeSetError(err);
    }
  }, [mapError, safeSetError]);

  // Hotels layer (on top of always-on gates)
  useEffect(() => {
    if (!map.current || mapError || active !== 'hotel') return;
    const m = map.current;
    try {
      const group = L.layerGroup().addTo(m);
      HOTELS.forEach((h) => {
        L.marker([h.lat, h.lng], { icon: makeIcon(LAYER_COLORS.hotel, 18, 9, '🏨') })
          .addTo(group)
          .bindPopup(
            `<strong>${h.name}</strong><br/><span style="color:#94a3b8">${h.nights} nights · ₹${h.rate.toLocaleString('en-IN')}</span>`,
          );
      });
      fitToLayer(HOTELS.map((h) => [h.lat, h.lng]), 0.2);
      return () => { try { m.removeLayer(group); } catch {} };
    } catch (err) {
      safeSetError(err);
    }
  }, [active, mapError, fitToLayer, safeSetError]);

  // Transit corridors layer (on top of always-on gates)
  useEffect(() => {
    if (!map.current || mapError || active !== 'transit') return;
    const m = map.current;
    try {
      const group = L.layerGroup().addTo(m);
      TRANSIT.forEach((seg) =>
        L.polyline(seg, { color: LAYER_COLORS.transit, weight: 3, opacity: 0.9 }).addTo(group),
      );
      fitToLayer(TRANSIT.flat(), 0.2);
      return () => { try { m.removeLayer(group); } catch {} };
    } catch (err) {
      safeSetError(err);
    }
  }, [active, mapError, fitToLayer, safeSetError]);

  // Shuttle routes layer (on top of always-on gates)
  useEffect(() => {
    if (!map.current || mapError || active !== 'shuttle') return;
    const m = map.current;
    try {
      const group = L.layerGroup().addTo(m);
      SHUTTLE.forEach((seg) =>
        L.polyline(seg, { color: LAYER_COLORS.shuttle, weight: 3, opacity: 0.9, dashArray: '6 6' }).addTo(group),
      );
      fitToLayer(SHUTTLE.flat(), 0.2);
      return () => { try { m.removeLayer(group); } catch {} };
    } catch (err) {
      safeSetError(err);
    }
  }, [active, mapError, fitToLayer, safeSetError]);

  // Framing presets per layer, used by the pill buttons:
  // clicking a pill refits the map so the layer AND the gates are visible.
  const refit = useCallback((key) => {
    const m = map.current;
    if (!m || mapError) return;
    try {
      if (key === 'gate') {
        // Stadium-only framing.
        m.flyTo([STADIUM.lat, STADIUM.lng], 18, { duration: 0.8 });
      } else if (key === 'hotel') {
        fitToLayer(HOTELS.map((h) => [h.lat, h.lng]), 0.2);
      } else if (key === 'transit') {
        fitToLayer(TRANSIT.flat(), 0.2);
      } else if (key === 'shuttle') {
        fitToLayer(SHUTTLE.flat(), 0.2);
      }
      m.invalidateSize();
    } catch (err) {
      safeSetError(err);
    }
  }, [fitToLayer, mapError, safeSetError]);

  const layerPills = [
    { key: 'gate', label: '🏟️ Gates' },
    { key: 'hotel', label: '🏨 Hotels' },
    { key: 'transit', label: '🚆 Transit' },
    { key: 'shuttle', label: '🚌 Shuttles' },
  ];

  const header = (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-widest text-cyber-400">Live geospatial layers</p>
      <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">The stadium, live on the map</h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-400">
        Eight gates, the two visitor corridors and every partner hotel and shuttle route — all on one map, updated live from every ticket booked today.
      </p>
      {mapError && <p className="mt-2 text-xs text-amber-300">Map unavailable: {mapError}</p>}
    </div>
  );

  const liveChip = mapError ? (
    <span className="chip border-amber-400/40 bg-amber-400/10 text-amber-300">Map unavailable</span>
  ) : (
    <span className="chip border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
      <span className="live-dot" /> Live
    </span>
  );

  const mapPanel = (
    <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/40">
      <div className="relative h-[440px] w-full overflow-hidden rounded-2xl">
        {mapError ? (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-ink-850/60">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-300">Live map layers</p>
              <p className="mt-1 text-xs text-slate-500 max-w-xs">Tiles and markers are still being prepared — the layer toggles below remain available when the map comes back.</p>
            </div>
          </div>
        ) : (
          <div ref={mapRef} className="map-dark-tiles relative h-full w-full overflow-hidden rounded-2xl" />
        )}

        <div className="pointer-events-auto absolute right-3 top-3 z-[1001] flex flex-wrap gap-2">
          {layerPills.map((layer) => (
            <button
              key={layer.key}
              onClick={() => {
                setActive(layer.key);
                refit(layer.key);
              }}
              disabled={!!mapError}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition disabled:opacity-40 disabled:cursor-not-allowed ${
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

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          {header}
          {liveChip}
        </div>
        {mapPanel}
      </div>
    </div>
  );
}
