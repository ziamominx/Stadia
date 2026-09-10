import { useState } from 'react';
import { api, useApi } from '../api.js';
import Kpi from '../components/Kpi.jsx';
import { Hotel, Utensils, CheckCircle } from '../components/Icons.jsx';

export default function HospitalityHub() {
  const { data: zonesData, loading: loadingZones } = useApi(api.hospitalityZones);
  const { data: merchantsData } = useApi(api.hospitalityMerchants);

  const [activeTab, setActiveTab] = useState('zones'); // 'zones' | 'merchants'
  const [partnerEnrolled, setPartnerEnrolled] = useState(false);

  if (loadingZones || !zonesData) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="h-96 animate-pulse rounded-2xl bg-ink-800" />
      </div>
    );
  }

  const { zones } = zonesData;
  const merchants = merchantsData?.merchants ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-cyber-400">Hospitality &amp; commercial services coordination</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Hospitality Partner Hub</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Synchronize accommodation room allotments, dynamic feeder shuttles and post-event dining dispersal across the city.
          </p>
        </div>

        <div className="glass flex items-center gap-1 rounded-full border border-white/10 p-1">
          {[
            { id: 'zones', label: `Accommodation zones (${zones.length})` },
            { id: 'merchants', label: `Dining dispersal partners (${merchants.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                activeTab === tab.id ? 'bg-gradient-to-r from-cyber-500 to-volt-500 text-ink-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI overview */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Core zone saturation" value={95} suffix="% full" icon="🏨" status="critical" sub="Nerul stadium proximity rooms exhausted" />
        <Kpi label="Peripheral capacity absorption" value={11700} icon="🛏️" status="ok" sub="Available across Belapur, Kharghar & Panvel" delay={0.05} />
        <Kpi label="Post-event dispersal absorption" value={10500} suffix="pax" icon="🍽️" status="info" sub="Capacity to absorb stadium exit crowd" delay={0.1} />
      </div>

      {/* Tab 1: accommodation zones */}
      {activeTab === 'zones' && (
        <div className="grid gap-6 md:grid-cols-2">
          {zones.map((zone, i) => {
            const isOverloaded = zone.occupancy_pct >= 90;
            const isRecommended = zone.is_overflow_recommended === 1;

            return (
              <div
                key={zone.id}
                className={`panel panel-hover fade-up space-y-4 rounded-2xl p-6 ${
                  isOverloaded ? '!border-rose-500/40' : isRecommended ? '!border-emerald-500/40' : ''
                }`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`chip ${
                        isOverloaded
                          ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                          : isRecommended
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                            : 'border-white/15 bg-white/[0.04] text-slate-300'
                      }`}
                    >
                      {isOverloaded ? 'Saturated core' : isRecommended ? 'Recommended overflow hub' : 'Balanced'}
                    </span>
                    <h3 className="mt-2 text-lg font-black tracking-tight text-white">{zone.name}</h3>
                    <p className="mt-1 text-xs text-slate-400">{zone.transit_link_desc}</p>
                  </div>
                  <div className="text-right">
                    <div className="tabular text-2xl font-black text-white">{zone.occupancy_pct}%</div>
                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Occupancy</div>
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs text-slate-400">
                    <span>{zone.booked_rooms.toLocaleString('en-IN')} booked</span>
                    <span>{zone.available_rooms.toLocaleString('en-IN')} available</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700/60">
                    <div
                      className={`h-full rounded-full grow-x ${
                        zone.occupancy_pct > 85 ? 'bg-rose-500' : zone.occupancy_pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${zone.occupancy_pct}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-white/[0.07] pt-3 text-xs">
                  <div>
                    <span className="text-slate-500">Average room rate:</span>
                    <div className="tabular text-sm font-black text-white">₹{zone.avg_rate.toLocaleString('en-IN')}/night</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Surge index:</span>
                    <div className={`text-sm font-black ${zone.surge_multiplier > 1.3 ? 'text-amber-300' : 'text-emerald-300'}`}>
                      {zone.surge_multiplier}x multiplier
                    </div>
                  </div>
                </div>

                {zone.hotels && zone.hotels.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Partner hotels in zone</span>
                    <div className="flex flex-wrap gap-1.5">
                      {zone.hotels.map((h) => (
                        <span key={h.id} className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300">
                          🏨 {h.name} <strong className="text-white">({h.tier})</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: dining & dispersal partners */}
      {activeTab === 'merchants' && (
        <div className="panel space-y-4 rounded-2xl p-6">
          <div>
            <h3 className="text-base font-black tracking-tight text-white">Post-event crowd dispersal program</h3>
            <p className="mt-1 text-xs text-slate-400">
              Partner venues offer event ticket holders exclusive discounts between 21:30 and 01:00 to delay exit surges and reduce platform and turnstile stampedes.
            </p>
          </div>

          <div className="grid gap-4 pt-2 md:grid-cols-2">
            {merchants.map((m, i) => (
              <div key={m.id} className="fade-up space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="chip border-violet-400/40 bg-violet-400/10 text-violet-300">
                      <Utensils className="h-3 w-3" /> {m.category} · {m.zone}
                    </span>
                    <h4 className="mt-2 text-sm font-bold text-white">{m.name}</h4>
                  </div>
                  <span className="chip border-emerald-500/40 bg-emerald-500/10 text-emerald-300">{m.discount_pct}% off</span>
                </div>

                <p className="text-xs leading-relaxed text-slate-400">{m.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-2 text-xs">
                  <span className="text-slate-400">
                    Dispersal delay: <strong className="text-slate-200">+{m.egress_delay_mins} mins</strong>
                  </span>
                  <span className="rounded-lg border border-white/10 bg-white/[0.05] px-2 py-0.5 font-mono font-bold text-white">
                    VOUCHER: {m.voucher_code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partner enrollment banner */}
      <div className="panel fade-up flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-ink-800 via-ink-850 to-ink-900 p-6 md:flex-row">
        <div className="space-y-1">
          <h3 className="text-base font-black tracking-tight text-white">Join the mega-event hospitality alliance</h3>
          <p className="max-w-xl text-xs text-slate-400">
            Are you a hotelier or restaurant operator in MMR? Synchronize your real-time inventory with STADIA to receive guaranteed shuttle-connected tourist bookings.
          </p>
        </div>

        <button onClick={() => setPartnerEnrolled(true)} disabled={partnerEnrolled} className="btn-primary shrink-0">
          {partnerEnrolled ? (
            <>
              <CheckCircle className="h-4 w-4" /> Partnership request logged
            </>
          ) : (
            'Enroll property'
          )}
        </button>
      </div>
    </div>
  );
}
