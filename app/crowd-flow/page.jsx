'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useApi, api } from '../../lib/api.js';
import {
  DoorClosed,
  Navigation,
  Shield,
  Zap,
  CheckCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Ticket,
  MapPin,
} from '../../components/Icons';

const DEFAULT_GATES = [
  {
    id: 1,
    name: 'Gate A · North Concourse',
    side: 'Local & VIP Transit',
    baseWait: 4,
    status: 'OPTIMAL',
    turnstilesOpen: 12,
    lat: 19.0601,
    lng: 73.0075,
    note: 'Fast-track express lanes active. Optimal for Blocks A & H.',
  },
  {
    id: 2,
    name: 'Gate B · West Concourse',
    side: 'Local Vehicle & Rail Spine',
    baseWait: 18,
    status: 'CONGESTED',
    turnstilesOpen: 10,
    lat: 19.0592,
    lng: 73.0065,
    note: 'Heavy queue. Divert 150m North to Gate A for 4-min entry.',
  },
  {
    id: 3,
    name: 'Gate C · East Concourse',
    side: 'Hotel Shuttle Drop Hub',
    baseWait: 5,
    status: 'OPTIMAL',
    turnstilesOpen: 14,
    lat: 19.0585,
    lng: 73.0090,
    note: 'Dedicated outstation high-throughput turnstiles. Smooth flow.',
  },
  {
    id: 4,
    name: 'Gate D · South Concourse',
    side: 'Highway Express Corridor',
    baseWait: 9,
    status: 'MODERATE',
    turnstilesOpen: 8,
    lat: 19.0575,
    lng: 73.0080,
    note: 'Moderate pacing. Best for Blocks D & E.',
  },
];

const FAN_WAYPOINTS = [
  { name: 'Water Refill Point 1', type: 'water', lat: 19.0605, lng: 73.0072, desc: 'Free chilled RO water' },
  { name: 'Medical Station North', type: 'medical', lat: 19.0608, lng: 73.0069, desc: 'First-aid & paramedic' },
  { name: 'Official Fan Store', type: 'merch', lat: 19.0598, lng: 73.0085, desc: 'Team jerseys & caps' },
  { name: 'Food Court & Lounge', type: 'food', lat: 19.0580, lng: 73.0088, desc: 'Food trucks & beverages' },
];

export default function FanCrowdFlowPage() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedGate, setSelectedGate] = useState(1);
  const [filterAmenities, setFilterAmenities] = useState(true);
  const [timeHorizon, setTimeHorizon] = useState('now'); // 'now', '30m', 'kickoff'
  const { data: ecosystem } = useApi(api.ecosystem);
  const { data: gatesApi } = useApi(api.gates);

  // Compute live ML wait times based on time horizon
  const gateData = DEFAULT_GATES.map((g) => {
    const liveApiGate = gatesApi?.find((apiG) => apiG.id === g.id);
    const loadMult = liveApiGate ? liveApiGate.load : 0.7;
    
    let waitMins = Math.round(g.baseWait * (loadMult / 0.7));
    let mlPredict = waitMins;

    if (timeHorizon === '30m') {
      mlPredict = Math.round(waitMins * 1.45);
    } else if (timeHorizon === 'kickoff') {
      mlPredict = Math.round(waitMins * 2.1);
    }

    const currentWait = timeHorizon === 'now' ? waitMins : mlPredict;
    const status = currentWait > 15 ? 'CONGESTED' : currentWait >= 7 ? 'MODERATE' : 'OPTIMAL';
    const statusColor =
      status === 'CONGESTED'
        ? 'text-rose-400 bg-rose-500/15 border-rose-500/30'
        : status === 'MODERATE'
        ? 'text-amber-400 bg-amber-500/15 border-amber-500/30'
        : 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';

    return {
      ...g,
      waitMins: currentWait,
      status,
      statusColor,
      surgeProb: Math.min(96, Math.round(loadMult * 100)),
    };
  });

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;
    if (!containerRef.current || mapRef.current) return;

    import('leaflet').then((leafletModule) => {
      if (!isMounted || !containerRef.current || mapRef.current) return;
      const L = leafletModule.default || leafletModule;

      const map = L.map(containerRef.current, { zoomControl: true }).setView([19.0588, 73.0075], 16);
      mapRef.current = map;

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      // Render markers
      renderMarkers(L, map);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const renderMarkers = (L, map) => {
    if (!map) return;
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    gateData.forEach((gate) => {
      const color = gate.status === 'CONGESTED' ? '#fb7185' : gate.status === 'MODERATE' ? '#fbbf24' : '#34d399';
      const icon = L.divIcon({
        className: '',
        html: `<div style="transform:translate(-50%,-100%);text-align:center;cursor:pointer">
          <div style="width:20px;height:20px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 0 10px ${color};margin:0 auto"></div>
          <div style="background:rgba(10,14,24,0.92);color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:9999px;margin-top:3px;border:1px solid rgba(255,255,255,0.2);white-space:nowrap">
            ${gate.name.split('·')[0]} · ${gate.waitMins}m
          </div>
        </div>`,
        iconSize: [0, 0],
      });

      const marker = L.marker([gate.lat, gate.lng], { icon }).addTo(map);
      marker.bindPopup(`<b>${gate.name}</b><br/>Wait time: <b>${gate.waitMins} mins</b><br/>${gate.note}`);
      marker.on('click', () => setSelectedGate(gate.id));
      markersRef.current.push(marker);
    });

    if (filterAmenities) {
      FAN_WAYPOINTS.forEach((pt) => {
        const icon = L.divIcon({
          className: '',
          html: `<div style="transform:translate(-50%,-50%);text-align:center;cursor:pointer">
            <div style="width:12px;height:12px;border-radius:9999px;background:#38bdf8;border:2px solid #fff;"></div>
            <div style="background:rgba(0,0,0,0.8);color:#93c5fd;font-size:9px;font-weight:600;padding:1px 5px;border-radius:4px;margin-top:2px;white-space:nowrap">${pt.name}</div>
          </div>`,
          iconSize: [0, 0],
        });
        const m = L.marker([pt.lat, pt.lng], { icon }).addTo(map);
        m.bindPopup(`<b>${pt.name}</b><br/>${pt.desc}`);
        markersRef.current.push(m);
      });
    }
  };

  useEffect(() => {
    if (mapRef.current) {
      import('leaflet').then((leafletModule) => {
        const L = leafletModule.default || leafletModule;
        renderMarkers(L, mapRef.current);
      });
    }
  }, [filterAmenities, timeHorizon, gatesApi]);

  const panToWaypoint = (w) => {
    if (mapRef.current) {
      mapRef.current.setView([w.lat, w.lng], 18, { animate: true });
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6 fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
              Live Stadium Radar · ML Ingress Telemetry
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
            Walkway Crowd Radar &amp; Gate Wait Times
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-400">
            Real-time turnstile queue tracker, predictive arrival forecasts, and fan waypoint amenities around DY Patil Stadium.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/ticket/FWC-1-A1-8842/confirmation"
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20"
          >
            <Ticket className="h-3.5 w-3.5 text-emerald-400" />
            <span>View My Digital Pass ↗</span>
          </Link>
        </div>
      </div>

      {/* Reroute Alert if ecosystem active */}
      {ecosystem?.gate_reroute_active && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/25 p-4 shadow-xl backdrop-blur-md flex items-start gap-3">
          <Zap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Stadium Ops Ingress Diversion Notice
              </span>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                Active
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-200">
              Gate B West Concourse is experiencing heavy lines. All ticket holders can use{' '}
              <strong className="text-white">Gate A North Concourse</strong> with verified QR fast-track access.
            </p>
          </div>
        </div>
      )}

      {/* Time Horizon Selector (ML Predictive Controls) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-800 bg-[#111114] p-3 px-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-bold text-white">Ingress Forecast Window:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTimeHorizon('now')}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              timeHorizon === 'now' ? 'bg-white text-black' : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            Live Current
          </button>
          <button
            onClick={() => setTimeHorizon('30m')}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              timeHorizon === '30m' ? 'bg-emerald-500 text-black font-bold' : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            +30 min (ML Inflow)
          </button>
          <button
            onClick={() => setTimeHorizon('kickoff')}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
              timeHorizon === 'kickoff' ? 'bg-amber-400 text-black font-bold' : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            Peak Kickoff (T-15m)
          </button>
        </div>
      </div>

      {/* Map + Live Queue Split Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Leaflet Map Card */}
        <div className="overflow-hidden rounded-3xl border border-neutral-800 bg-[#0e0e12] shadow-2xl flex flex-col">
          <div className="flex items-center justify-between border-b border-neutral-800 bg-[#121217] p-3.5 px-4">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Navigation className="h-3.5 w-3.5 text-emerald-400" />
              <span>Perimeter Corridor Radar</span>
            </div>
            <label className="flex items-center gap-1.5 text-xs text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filterAmenities}
                onChange={(e) => setFilterAmenities(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-0"
              />
              <span>Show Water &amp; First-Aid</span>
            </label>
          </div>

          <div ref={containerRef} className="h-96 w-full relative z-0" />

          <div className="p-3.5 border-t border-neutral-800 bg-[#121217] flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 inline-block" /> &lt;7 min wait
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block" /> 7–15 min wait
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400 inline-block" /> &gt;15 min wait
              </span>
            </div>
            <span className="font-mono text-neutral-500">ML updated live</span>
          </div>
        </div>

        {/* Live Gate Cards */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
            Turnstile Ingress Queue Status
          </h2>

          <div className="space-y-3">
            {gateData.map((g) => (
              <div
                key={g.id}
                onClick={() => {
                  setSelectedGate(g.id);
                  if (mapRef.current) {
                    mapRef.current.setView([g.lat, g.lng], 17, { animate: true });
                  }
                }}
                className={`cursor-pointer rounded-2xl border p-4 transition shadow-lg ${
                  selectedGate === g.id
                    ? 'border-emerald-500/80 bg-neutral-900/90 ring-1 ring-emerald-500/50'
                    : 'border-neutral-800 bg-[#0e0e12] hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">{g.name}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${g.statusColor}`}>
                        {g.waitMins} MIN WAIT
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{g.side}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-neutral-300">{g.turnstilesOpen} Lanes</div>
                    <div className="text-[10px] text-emerald-400 uppercase font-mono">{g.surgeProb}% capacity</div>
                  </div>
                </div>

                <p className="mt-2 text-xs text-neutral-300 leading-relaxed border-t border-neutral-800/80 pt-2">
                  {g.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fan Waypoints & Amenities Quick Bar (Clickable) */}
      <div className="rounded-3xl border border-neutral-800 bg-[#0e0e12] p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
          Perimeter Fan Amenities &amp; Support Booths (Click to locate)
        </h3>
        <div className="grid sm:grid-cols-4 gap-3">
          {FAN_WAYPOINTS.map((w, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => panToWaypoint(w)}
              className="text-left rounded-2xl border border-neutral-800 bg-[#141418] p-3.5 space-y-1 hover:border-sky-500/60 transition cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white">{w.name}</div>
                <MapPin className="h-3 w-3 text-sky-400" />
              </div>
              <div className="text-[11px] text-neutral-400">{w.desc}</div>
              <div className="text-[10px] text-sky-400 font-mono pt-1">Click to Pan Map ↗</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
