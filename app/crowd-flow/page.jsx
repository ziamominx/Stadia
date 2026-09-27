'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useApi, api } from '../../lib/api.js';
import { DY_PATIL, STADIUM_GATES } from '../../lib/operations/dy-patil.mjs';
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
} from '../../components/Icons';

const SAMPLE_WAITS = [4, 18, 5, 9, 7, 6, 12, 4];
const GATE_RADAR_DATA = STADIUM_GATES.map((gate, index) => {
  const waitMins = SAMPLE_WAITS[index];
  const status = waitMins > 15 ? 'CONGESTED' : waitMins >= 8 ? 'MODERATE' : 'OPTIMAL';
  return {
    id: gate.id,
    name: `Gate ${gate.id} · ${gate.name}`,
    side: `${gate.corridor === 'local' ? 'Local' : 'Outstation'} approach`,
    waitMins,
    status,
    statusColor: status === 'CONGESTED' ? 'text-rose-400 bg-rose-500/15 border-rose-500/30' : status === 'MODERATE' ? 'text-amber-400 bg-amber-500/15 border-amber-500/30' : 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    lat: gate.lat,
    lng: gate.lng,
    note: 'Illustrative wait estimate. Confirm current conditions with venue staff.',
  };
});

const FAN_WAYPOINTS = [
  { name: 'Water refill area', type: 'water', lat: 19.0437, lng: 73.0262, desc: 'Indicative north concourse location' },
  { name: 'Medical support area', type: 'medical', lat: 19.0436, lng: 73.0269, desc: 'Indicative first-aid location' },
  { name: 'Fan merchandise area', type: 'merch', lat: 19.0419, lng: 73.0285, desc: 'Indicative east concourse location' },
  { name: 'Food and lounge area', type: 'food', lat: 19.0403, lng: 73.0269, desc: 'Indicative south concourse location' },
];

export default function FanCrowdFlowPage() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const amenitiesRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [selectedGate, setSelectedGate] = useState('A');
  const [filterAmenities, setFilterAmenities] = useState(true);
  const { data: ecosystem } = useApi(api.ecosystem);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;
    if (!containerRef.current || mapRef.current) return;

    import('leaflet').then((leafletModule) => {
      if (!isMounted || !containerRef.current || mapRef.current) return;
      const L = leafletModule.default || leafletModule;

      const map = L.map(containerRef.current, { zoomControl: true }).setView([DY_PATIL.lat, DY_PATIL.lng], 17);
      mapRef.current = map;

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      // Add Gate Markers
      GATE_RADAR_DATA.forEach((gate) => {
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
        marker.bindPopup(`<b>${gate.name}</b><br/>Illustrative wait: <b>${gate.waitMins} mins</b><br/>${gate.note}`);
        marker.on('click', () => setSelectedGate(gate.id));
      });
      amenitiesRef.current = L.layerGroup().addTo(map);
      setMapReady(true);
    });

    return () => {
      isMounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
      amenitiesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !amenitiesRef.current) return;
    let active = true;
    import('leaflet').then((leafletModule) => {
      if (!active || !amenitiesRef.current) return;
      const L = leafletModule.default || leafletModule;
      amenitiesRef.current.clearLayers();
      if (filterAmenities) {
        FAN_WAYPOINTS.forEach((pt) => {
          const icon = L.divIcon({
            className: '',
            html: `<div style="transform:translate(-50%,-50%);text-align:center">
              <div style="width:12px;height:12px;border-radius:9999px;background:#38bdf8;border:2px solid #fff;"></div>
              <div style="background:rgba(0,0,0,0.8);color:#93c5fd;font-size:9px;font-weight:600;padding:1px 5px;border-radius:4px;margin-top:2px;white-space:nowrap">${pt.name}</div>
            </div>`,
            iconSize: [0, 0],
          });
          L.marker([pt.lat, pt.lng], { icon }).addTo(amenitiesRef.current).bindTooltip(`${pt.name} · indicative location`);
        });
      }
    });

    return () => { active = false; };
  }, [mapReady, filterAmenities]);

  useEffect(() => {
    const gate = GATE_RADAR_DATA.find((item) => item.id === selectedGate);
    if (mapReady && gate) mapRef.current?.panTo([gate.lat, gate.lng], { animate: true });
  }, [mapReady, selectedGate]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6 fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
              Stadium Gate Reference · Illustrative Waits
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
            Walkway Crowd Radar & Gate Wait Times
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-400">
            DY Patil Stadium gate locations with illustrative wait estimates and sample amenity positions. No live turnstile feed is connected.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/ticket/FWC-1-A1-8842/confirmation"
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20"
          >
            <Ticket className="h-3.5 w-3.5 text-emerald-400" />
            <span>View My Digital Pass</span>
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
              A demo diversion is active. Follow venue staff directions and check your ticket before switching gates.
            </p>
          </div>
        </div>
      )}

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
              <span>Show sample amenities</span>
            </label>
          </div>

          <div ref={containerRef} className="h-96 w-full relative z-0" />

          <div className="p-3.5 border-t border-neutral-800 bg-[#121217] flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 inline-block" /> &lt;5 min wait
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block" /> 5–15 min wait
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400 inline-block" /> &gt;15 min wait
              </span>
            </div>
            <span className="font-mono text-neutral-500">Reference map · waits are illustrative</span>
          </div>
        </div>

        {/* Live Gate Cards */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
            Illustrative Gate Wait Estimates
          </h2>

          <div className="space-y-3">
            {GATE_RADAR_DATA.map((g) => (
              <button type="button"
                key={g.id}
                onClick={() => setSelectedGate(g.id)}
                aria-pressed={selectedGate === g.id}
                className={`block w-full text-left cursor-pointer rounded-2xl border p-4 transition shadow-lg ${
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
                </div>

                <p className="mt-2 text-xs text-neutral-300 leading-relaxed border-t border-neutral-800/80 pt-2">
                  {g.note}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fan Waypoints & Amenities Quick Bar */}
      <div className="rounded-3xl border border-neutral-800 bg-[#0e0e12] p-5 shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
          Perimeter Fan Amenities & Support Booths
        </h3>
        <div className="grid sm:grid-cols-4 gap-3">
          {FAN_WAYPOINTS.map((w, idx) => (
            <div key={idx} className="rounded-2xl border border-neutral-800 bg-[#141418] p-3.5 space-y-1">
              <div className="text-xs font-bold text-white">{w.name}</div>
              <div className="text-[11px] text-neutral-400">{w.desc}</div>
              <div className="text-[10px] text-emerald-400 font-mono pt-1">Illustrative location · confirm on site</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
