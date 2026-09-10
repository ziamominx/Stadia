import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api, useApi } from '../api.js';
import Kpi from '../components/Kpi.jsx';
import LiveBadge from '../components/LiveBadge.jsx';
import { AlertTriangle, CheckCircle, Layers, RefreshCw, Zap, Hotel, Train, Shield } from '../components/Icons.jsx';

const loadColor = (pct) => (pct > 80 ? 'bg-rose-500' : pct > 65 ? 'bg-amber-500' : 'bg-emerald-500');

const corridorStatus = {
  chokepoint: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  disrupted: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  heavy: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  nominal: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
};

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

  const toggleLayer = (key) => setActiveLayers((prev) => ({ ...prev, [key]: !prev[key] }));

  const executeMitigation = async (title, actionType, impactMetric) => {
    setIsSubmitting(true);
    try {
      await api.applyIntervention({
        title,
        actionType,
        impactMetric,
        description: 'Dispatched tactical action from Command Center console.',
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

  // Initialize map once the page (and its container) has rendered past loading
  useEffect(() => {
    if (loading || !mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, { zoomControl: true }).setView([19.052, 73.03], 12);
    mapInstanceRef.current = map;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    layersGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [loading]);

  // Update layers when data or layer toggles change
  useEffect(() => {
    if (!mapInstanceRef.current || !layersGroupRef.current || !data) return;

    layersGroupRef.current.clearLayers();
    const { zones, gates, merchants } = data;

    // Hotels & accommodation zones
    if (activeLayers.hotels && zones) {
      zones.forEach((z) => {
        const isCritical = z.status === 'critical';
        const isRecommended = z.is_overflow_recommended === 1;
        const color = isCritical ? '#fb7185' : isRecommended ? '#34d399' : '#38bdf8';

        L.circle([z.lat, z.lng], {
          radius: isCritical ? 1400 : 1100,
          color,
          fillColor: color,
          fillOpacity: 0.14,
          weight: 2,
        }).addTo(layersGroupRef.current);

        const icon = L.divIcon({
          className: '',
          html: `<div style="background:${color};width:28px;height:28px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:13px;border:2px solid rgba(255,255,255,0.85);box-shadow:0 4px 12px rgba(0,0,0,0.55)">🏨</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker([z.lat, z.lng], { icon })
          .addTo(layersGroupRef.current)
          .bindPopup(`
            <div style="font-size:12px">
              <strong style="font-size:13px;display:block;margin-bottom:4px;color:#7dd3fc">${z.name}</strong>
              <div>Occupancy: <b style="color:#fff">${z.occupancy_pct}%</b> (${z.booked_rooms} / ${z.total_rooms} rooms)</div>
              <div>Avg rate: <b style="color:#fff">₹${z.avg_rate.toLocaleString('en-IN')}</b>/night (surge ${z.surge_multiplier}x)</div>
              <div style="color:#94a3b8;font-size:11px;margin-top:4px">${z.transit_link_desc}</div>
              ${isRecommended ? '<div style="margin-top:6px;background:rgba(52,211,153,0.18);color:#6ee7b7;padding:2px 6px;border-radius:4px;font-weight:700;font-size:10px;display:inline-block">Recommended overflow hub</div>' : ''}
            </div>
          `);
      });
    }

    // Gates
    if (activeLayers.gates && gates) {
      gates.forEach((g) => {
        const color = g.status === 'critical' ? '#fb7185' : g.status === 'warning' ? '#fbbf24' : '#34d399';
        const icon = L.divIcon({
          className: '',
          html: `<div style="background:${color};width:26px;height:26px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid rgba(255,255,255,0.85);box-shadow:0 4px 10px rgba(0,0,0,0.55)">🚪</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        L.marker([g.lat, g.lng], { icon })
          .addTo(layersGroupRef.current)
          .bindPopup(`
            <div style="font-size:12px">
              <strong style="font-size:13px;display:block;color:#7dd3fc">${g.name}</strong>
              <div>Side: <b style="color:#fff">${g.side}</b></div>
              <div>Load: <b style="color:#fff">${g.load_pct}%</b> (${g.assigned} / ${g.capacity})</div>
              <div>Projected wait: <b style="color:#fff">${g.projected_wait_mins} mins</b></div>
            </div>
          `);
      });
    }

    // Dining dispersal merchants
    if (activeLayers.merchants && merchants) {
      merchants.forEach((m) => {
        const lat = 19.043 + m.id * 0.007;
        const lng = 73.018 + m.id * 0.004;
        const icon = L.divIcon({
          className: '',
          html: `<div style="background:#a78bfa;width:26px;height:26px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid rgba(255,255,255,0.85);box-shadow:0 4px 10px rgba(0,0,0,0.55)">🍽️</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        L.marker([lat, lng], { icon })
          .addTo(layersGroupRef.current)
          .bindPopup(`
            <div style="font-size:12px">
              <strong style="font-size:13px;display:block;color:#7dd3fc">${m.name}</strong>
              <div style="color:#c4b5fd;font-weight:700">Voucher: ${m.voucher_code} (${m.discount_pct}% off)</div>
              <div style="font-size:11px;margin-top:4px;color:#94a3b8">${m.description}</div>
              <div style="font-size:10px;color:#64748b;margin-top:2px">Absorption capacity: ${m.capacity.toLocaleString('en-IN')} attendees</div>
            </div>
          `);
      });
    }
  }, [data, activeLayers]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="h-96 animate-pulse rounded-2xl bg-ink-800" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <p className="text-lg text-slate-300">Failed to load ecosystem state: {error?.message}</p>
        <button onClick={reload} className="btn-primary mt-4">Retry</button>
      </div>
    );
  }

  const { zones, transit, gates, merchants, metrics, activeScenario } = data;

  const interventions = [
    {
      title: 'Deploy 16 rapid shuttles',
      impact: '-28% highway load',
      desc: 'Mobilize electric feeder buses from Belapur Metro terminal to relieve Sion-Panvel Expressway.',
      cta: 'Dispatch fleet',
      actionType: 'SHUTTLE_DISPATCH',
    },
    {
      title: 'Broadcast early-bird F&B pass',
      impact: '-34% gate queue',
      desc: 'Send instant WhatsApp & app push offering ₹250 concessions voucher for arrivals between T-3h and T-2h.',
      cta: 'Send push nudge',
      actionType: 'NUDGE_BROADCAST',
    },
    {
      title: 'Activate Kharghar overflow buffer',
      impact: '+3,400 rooms',
      desc: 'Trigger partner hotel inventory in Kharghar Green Zone with complimentary Metro passes to relieve saturated Core Nerul.',
      cta: 'Release buffer',
      actionType: 'HOTEL_OVERFLOW',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-3">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-cyber-400">Ecosystem digital twin</p>
            <LiveBadge label="Live sync" />
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Mega-Event Command Center</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Real-time cross-sector orchestration across accommodation saturation, transit corridors, gate queues and hospitality dispersal.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="chip border-cyber-400/40 bg-cyber-400/10 text-cyber-300">
            Scenario · {activeScenario.replace('_', ' ')}
          </div>
          <button onClick={reload} className="btn-ghost !px-4 !py-2.5 text-[13px]">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          label="Hotel saturation"
          value={metrics.avgHotelSaturation}
          suffix="%"
          icon="🏨"
          status={metrics.avgHotelSaturation > 85 ? 'warn' : 'ok'}
          sub={`${metrics.totalRoomsBooked.toLocaleString('en-IN')} / ${metrics.totalRoomsTracked.toLocaleString('en-IN')} rooms booked`}
        />
        <Kpi
          label="Transit load index"
          value={metrics.avgTransitLoad}
          suffix="%"
          icon="🚆"
          status={metrics.avgTransitLoad > 80 ? 'warn' : 'ok'}
          sub={`${transit.length} multimodal corridors active`}
          delay={0.05}
        />
        <Kpi
          label="Gate pressure"
          value={metrics.flaggedGatesCount}
          suffix={`/ ${gates.length}`}
          icon="🚪"
          status={metrics.flaggedGatesCount ? 'warn' : 'ok'}
          sub="Gates flagged above 75% load"
          delay={0.1}
        />
        <Kpi
          label="Ecosystem health"
          value={metrics.ecosystemHealthScore}
          suffix="/100"
          icon="⚡"
          status="ok"
          sub="Orchestration auto-stabilized"
          delay={0.15}
        />
      </div>

      {dispatchStatus && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <span className="font-semibold">{dispatchStatus}</span>
          <CheckCircle className="h-4 w-4" />
        </div>
      )}

      {/* Map + control dock */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="panel flex flex-col gap-4 rounded-2xl p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.07] pb-3">
            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
              <Layers className="h-4 w-4 text-cyber-400" /> Live geospatial layers
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: 'hotels', label: '🏨 Hotels & zones' },
                { key: 'transit', label: '🚆 Transit corridors' },
                { key: 'gates', label: '🏟️ Gates' },
                { key: 'merchants', label: '🍽️ Fan dispersal' },
              ].map((layer) => (
                <button
                  key={layer.key}
                  onClick={() => toggleLayer(layer.key)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                    activeLayers[layer.key]
                      ? 'bg-gradient-to-r from-cyber-500 to-volt-500 text-ink-950'
                      : 'border border-white/15 bg-white/[0.03] text-slate-400 hover:text-white'
                  }`}
                >
                  {layer.label}
                </button>
              ))}
            </div>
          </div>
          <div ref={mapContainerRef} className="map-dark-tiles relative h-[480px] w-full overflow-hidden rounded-xl border border-white/10 shadow-lg shadow-black/30" />
        </div>

        {/* Tactical dispatch + alerts */}
        <div className="space-y-6">
          <div className="panel space-y-4 rounded-2xl p-5">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-300">
                <Zap className="h-4 w-4 text-volt-400" /> Tactical interventions
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">One-click dispatch</span>
            </div>

            <div className="space-y-3">
              {interventions.map((iv) => (
                <div key={iv.actionType} className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-bold text-white">{iv.title}</span>
                    <span className="chip border-emerald-500/40 bg-emerald-500/10 text-emerald-300">{iv.impact}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">{iv.desc}</p>
                  <button
                    disabled={isSubmitting}
                    onClick={() => executeMitigation(iv.title, iv.actionType, iv.impact)}
                    className="btn-primary w-full !py-2 text-xs"
                  >
                    {iv.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="panel space-y-3 rounded-2xl p-5">
            <div className="flex items-center gap-2 border-b border-white/[0.07] pb-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-300">
              <AlertTriangle className="h-4 w-4 text-amber-400" /> Predictive bottleneck feed
            </div>

            <div className="space-y-2.5">
              {zones.filter((z) => z.occupancy_pct >= 85).map((z) => (
                <div key={z.id} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-2.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-amber-300">
                    <span>🏨 {z.name}</span>
                    <span className="tabular">{z.occupancy_pct}%</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">Severe capacity pressure. Diverting new inbound bookings to Belapur/Kharghar.</p>
                </div>
              ))}
              {transit.filter((t) => t.current_load_pct >= 80).map((t) => (
                <div key={t.id} className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-2.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-rose-300">
                    <span>🚆 {t.name}</span>
                    <span className="tabular">{t.current_load_pct}%</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">Corridor approaching gridlock. Recommend park-and-ride feeder diversion.</p>
                </div>
              ))}
              {zones.filter((z) => z.occupancy_pct >= 85).length === 0 && transit.filter((t) => t.current_load_pct >= 80).length === 0 && (
                <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300">
                  All monitored systems nominal — no bottlenecks predicted.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Corridor telemetry table */}
      <div className="panel overflow-hidden rounded-2xl">
        <div className="border-b border-white/[0.07] p-5">
          <h3 className="text-base font-black tracking-tight text-white">Multimodal corridor telemetry</h3>
          <p className="mt-1 text-xs text-slate-400">Transit throughput, current passenger flow and operational status.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] text-left text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                <th className="px-5 py-3.5">Corridor</th>
                <th className="px-5 py-3.5">Mode</th>
                <th className="px-5 py-3.5">Capacity / hr</th>
                <th className="px-5 py-3.5">Current load</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Route</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {transit.map((t) => (
                <tr key={t.id} className="transition hover:bg-white/[0.03]">
                  <td className="px-5 py-3.5 font-bold text-white">{t.name}</td>
                  <td className="px-5 py-3.5">
                    <span className="chip border-white/15 bg-white/[0.04] text-slate-300">{t.mode.replaceAll('_', ' ')}</span>
                  </td>
                  <td className="tabular px-5 py-3.5 text-slate-300">{t.capacity_per_hr.toLocaleString('en-IN')} pax</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="tabular w-9 text-xs font-black text-white">{t.current_load_pct}%</span>
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-700/60">
                        <div className={`h-full rounded-full grow-x ${loadColor(t.current_load_pct)}`} style={{ width: `${t.current_load_pct}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`chip ${corridorStatus[t.status] ?? corridorStatus.nominal}`}>{t.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-[11px] text-slate-400">
                    {t.from_location} → {t.to_location}
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
