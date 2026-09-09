import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api, useApi } from '../api.js';
import { Activity, Shield, MapPin, Hotel, Bus, Train, AlertTriangle, CheckCircle, Clock, Zap, Layers, RefreshCw, ArrowRight } from '../components/Icons.jsx';

export default function CommandCenter() {
  const { data, loading, error, reload } = useApi(api.ecosystem);
  const [activeLayers, setActiveLayers] = useState({
    hotels: true,
    transit: true,
    gates: true,
    merchants: true,
  });
  const [dispatchStatus, setDispatchStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef(null);

  const toggleLayer = (key) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const executeMitigation = async (title, actionType, impactMetric) => {
    setIsSubmitting(true);
    try {
      await api.applyIntervention({
        title,
        actionType,
        impactMetric,
        description: `Dispatched tactical action from Command Center console.`
      });
      setDispatchStatus(`Tactical Action Applied: ${title} (${impactMetric})`);
      reload();
      setTimeout(() => setDispatchStatus(null), 5000);
    } catch (err) {
      setDispatchStatus(`Failed to apply action: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize Vanilla Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, { zoomControl: true }).setView([19.052, 73.030], 12);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);

    layersGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Layers dynamically when data or activeLayers change
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current || !data) return;

    layersGroupRef.current.clearLayers();

    const { zones, gates, merchants } = data;

    // 1. Hotels & Accommodation Zones Layer
    if (activeLayers.hotels && zones) {
      zones.forEach(z => {
        const isCritical = z.status === 'critical';
        const isRecommended = z.is_overflow_recommended === 1;
        const color = isCritical ? '#ef4444' : isRecommended ? '#10b981' : '#3b82f6';

        // Zone Radius Circle
        L.circle([z.lat, z.lng], {
          radius: isCritical ? 1400 : 1100,
          color,
          fillColor: color,
          fillOpacity: 0.18,
          weight: 2,
        }).addTo(layersGroupRef.current);

        // Marker
        const icon = L.divIcon({
          className: '',
          html: `<div style="background: ${color}; width: 28px; height: 28px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: bold; border: 2px solid rgba(255,255,255,0.85); box-shadow: 0 4px 12px rgba(0,0,0,0.5);">🏨</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker([z.lat, z.lng], { icon })
          .addTo(layersGroupRef.current)
          .bindPopup(`
            <div style="color: #09090b; font-family: sans-serif; font-size: 12px;">
              <strong style="font-size: 14px; display: block; margin-bottom: 4px;">${z.name}</strong>
              <div>Occupancy: <b>${z.occupancy_pct}%</b> (${z.booked_rooms} / ${z.total_rooms} rooms)</div>
              <div>Avg Rate: ₹${z.avg_rate.toLocaleString('en-IN')}/night (Surge ${z.surge_multiplier}x)</div>
              <div style="color: #52525b; font-size: 11px; margin-top: 4px;">${z.transit_link_desc}</div>
              ${isRecommended ? '<div style="margin-top: 6px; background: #059669; color: white; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; display: inline-block;">Recommended Overflow Hub</div>' : ''}
            </div>
          `);
      });
    }

    // 2. Gates Layer
    if (activeLayers.gates && gates) {
      gates.forEach(g => {
        const color = g.status === 'critical' ? '#ef4444' : g.status === 'warning' ? '#f59e0b' : '#10b981';
        const icon = L.divIcon({
          className: '',
          html: `<div style="background: ${color}; width: 26px; height: 26px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">🚪</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        L.marker([g.lat, g.lng], { icon })
          .addTo(layersGroupRef.current)
          .bindPopup(`
            <div style="color: #09090b; font-family: sans-serif; font-size: 12px;">
              <strong style="font-size: 14px; display: block;">${g.name}</strong>
              <div>Side: <b>${g.side}</b></div>
              <div>Load: <b>${g.load_pct}%</b> (${g.assigned} / ${g.capacity})</div>
              <div>Projected Wait: <b>${g.projected_wait_mins} mins</b></div>
            </div>
          `);
      });
    }

    // 3. Dining Dispersal Merchants Layer
    if (activeLayers.merchants && merchants) {
      merchants.forEach(m => {
        const lat = 19.043 + (m.id * 0.007);
        const lng = 73.018 + (m.id * 0.004);
        const icon = L.divIcon({
          className: '',
          html: `<div style="background: #8b5cf6; width: 26px; height: 26px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">🍽️</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        L.marker([lat, lng], { icon })
          .addTo(layersGroupRef.current)
          .bindPopup(`
            <div style="color: #09090b; font-family: sans-serif; font-size: 12px;">
              <strong style="font-size: 14px; display: block;">${m.name}</strong>
              <div style="color: #6d28d9; font-weight: bold;">Voucher: ${m.voucher_code} (${m.discount_pct}% OFF)</div>
              <div style="font-size: 11px; margin-top: 4px; color: #52525b;">${m.description}</div>
              <div style="font-size: 10px; color: #71717a; margin-top: 2px;">Absorption capacity: ${m.capacity} attendees</div>
            </div>
          `);
      });
    }
  }, [data, activeLayers]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="h-96 animate-pulse rounded-3xl bg-neutral-900/60 border border-neutral-800" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-red-400">Failed to load ecosystem state: {error?.message}</p>
        <button onClick={reload} className="mt-4 rounded-full bg-white px-5 py-2 text-xs font-bold text-black">Retry</button>
      </div>
    );
  }

  const { zones, transit, gates, merchants, metrics, activeScenario } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8 fade-up">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              Autonomous Ecosystem Digital Twin
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Mega-Event Command Center
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Real-time cross-sector orchestration across accommodation saturation, transit corridors, gate queues, and hospitality dispersal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-neutral-800 bg-[#111114] px-4 py-2 text-right">
            <div className="text-[10px] uppercase font-bold text-neutral-500">Active Scenario</div>
            <div className="text-sm font-black text-white capitalize">{activeScenario.replace('_', ' ')}</div>
          </div>
          <button
            onClick={reload}
            className="flex items-center gap-2 rounded-full border border-neutral-800 bg-[#111114] px-4 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Live Sync
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Hotel Saturation</span>
            <Hotel className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">{metrics.avgHotelSaturation}%</div>
          <div className="mt-1 text-xs text-neutral-500">
            {metrics.totalRoomsBooked.toLocaleString('en-IN')} / {metrics.totalRoomsTracked.toLocaleString('en-IN')} rooms booked
          </div>
          <div className="mt-3 w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${metrics.avgHotelSaturation > 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${metrics.avgHotelSaturation}%` }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Transit Load Index</span>
            <Train className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">{metrics.avgTransitLoad}%</div>
          <div className="mt-1 text-xs text-neutral-500">5 multimodal corridors active</div>
          <div className="mt-3 w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${metrics.avgTransitLoad > 80 ? 'bg-amber-500' : 'bg-blue-500'}`}
              style={{ width: `${metrics.avgTransitLoad}%` }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Gate Pressure</span>
            <Shield className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">{metrics.flaggedGatesCount} / {gates.length}</div>
          <div className="mt-1 text-xs text-neutral-500">Gates flagged &gt; 75% load</div>
          <div className="mt-3 flex gap-1">
            {gates.map(g => (
              <span
                key={g.id}
                className={`h-1.5 flex-1 rounded-full ${g.status === 'critical' ? 'bg-rose-500' : g.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'}`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Ecosystem Health</span>
            <Zap className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-black text-white">{metrics.ecosystemHealthScore}/100</div>
          <div className="mt-1 text-xs text-emerald-400 font-medium">Orchestration auto-stabilized</div>
          <div className="mt-3 w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${metrics.ecosystemHealthScore}%` }}
            />
          </div>
        </div>
      </div>

      {dispatchStatus && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300 flex items-center justify-between">
          <span className="font-semibold">{dispatchStatus}</span>
          <CheckCircle className="h-4 w-4 text-emerald-400" />
        </div>
      )}

      {/* Main Visual: Map + Control Dock */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Geospatial Map */}
        <div className="lg:col-span-2 rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 shadow-xl flex flex-col space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-neutral-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">Live Geospatial Layers</span>
            </div>

            {/* Layer Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: 'hotels', label: '🏨 Hotels & Zones', active: activeLayers.hotels },
                { key: 'transit', label: '🚆 Transit Corridors', active: activeLayers.transit },
                { key: 'gates', label: '🏟️ Gates & Turnstiles', active: activeLayers.gates },
                { key: 'merchants', label: '🍽️ Fan Dispersal', active: activeLayers.merchants },
              ].map(layer => (
                <button
                  key={layer.key}
                  onClick={() => toggleLayer(layer.key)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    layer.active
                      ? 'bg-white text-black shadow-md'
                      : 'border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  {layer.label}
                </button>
              ))}
            </div>
          </div>

          <div
            ref={mapContainerRef}
            className="relative h-[480px] w-full rounded-2xl overflow-hidden border border-neutral-800/70"
          />
        </div>

        {/* Tactical Mitigation & Alerts Dock */}
        <div className="space-y-6">
          {/* Tactical Dispatch Console */}
          <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">Tactical Interventions</h3>
              </div>
              <span className="text-[10px] text-neutral-400">One-Click Dispatch</span>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Deploy 16 Rapid Shuttles</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">-28% Highway Load</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Mobilize electric feeder buses from Belapur Metro terminal to relieve Sion-Panvel Expressway.
                </p>
                <button
                  disabled={isSubmitting}
                  onClick={() => executeMitigation('Deploy 16 Rapid Shuttles', 'SHUTTLE_DISPATCH', '-28% Highway Congestion')}
                  className="w-full rounded-full bg-white py-1.5 text-xs font-bold text-black hover:bg-neutral-200 transition disabled:opacity-50"
                >
                  Dispatch Fleet
                </button>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Broadcast Early-Bird F&B Pass</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">-34% Gate Queue</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Send instant WhatsApp & app push offering ₹250 concessions voucher for arrivals between T-3h and T-2h.
                </p>
                <button
                  disabled={isSubmitting}
                  onClick={() => executeMitigation('Broadcast Early Ingress Vouchers', 'NUDGE_BROADCAST', '-34% Gate Wait Times')}
                  className="w-full rounded-full bg-white py-1.5 text-xs font-bold text-black hover:bg-neutral-200 transition disabled:opacity-50"
                >
                  Send Push Nudge
                </button>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Activate Kharghar Overflow Buffer</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">+3,400 Rooms</span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  Trigger partner hotel inventory in Kharghar Green Zone with complimentary Metro passes to relieve saturated Core Nerul.
                </p>
                <button
                  disabled={isSubmitting}
                  onClick={() => executeMitigation('Activate Kharghar Overflow Buffer', 'HOTEL_OVERFLOW', '+3,400 Buffer Rooms Released')}
                  className="w-full rounded-full bg-white py-1.5 text-xs font-bold text-black hover:bg-neutral-200 transition disabled:opacity-50"
                >
                  Release Buffer
                </button>
              </div>
            </div>
          </div>

          {/* Live Bottleneck Alerts */}
          <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-3">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Predictive Bottleneck Feed</h3>
            </div>

            <div className="space-y-2.5">
              {zones.filter(z => z.occupancy_pct >= 85).map(z => (
                <div key={z.id} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-amber-300">
                    <span>🏨 {z.name}</span>
                    <span>{z.occupancy_pct}% Saturation</span>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    Severe capacity pressure. Diverting new inbound bookings to Belapur/Kharghar.
                  </p>
                </div>
              ))}

              {transit.filter(t => t.current_load_pct >= 80).map(t => (
                <div key={t.id} className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-rose-300">
                    <span>🚆 {t.name}</span>
                    <span>{t.current_load_pct}% Load</span>
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    Corridor approaching gridlock. Recommend park-and-ride feeder diversion.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transit Corridors & Capacity Distribution Table */}
      <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Multimodal Corridor Telemetry</h3>
            <p className="text-xs text-neutral-400">Transit throughput, current passenger flow, and operational status.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pr-4">Corridor Name</th>
                <th className="pb-3 pr-4">Mode</th>
                <th className="pb-3 pr-4">Capacity / Hr</th>
                <th className="pb-3 pr-4">Current Load</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 text-right">Route</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {transit.map(t => (
                <tr key={t.id} className="hover:bg-neutral-900/40">
                  <td className="py-3 pr-4 font-bold text-white">{t.name}</td>
                  <td className="py-3 pr-4 capitalize text-neutral-300">
                    <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-[10px] font-medium text-neutral-300">
                      {t.mode.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-neutral-300">{t.capacity_per_hr.toLocaleString('en-IN')} pax</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white w-8">{t.current_load_pct}%</span>
                      <div className="w-24 bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${t.current_load_pct > 80 ? 'bg-rose-500' : t.current_load_pct > 65 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${t.current_load_pct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      t.status === 'chokepoint' || t.status === 'disrupted'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : t.status === 'heavy'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-right text-neutral-400 font-mono text-[11px]">
                    {t.from_location} &rarr; {t.to_location}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
