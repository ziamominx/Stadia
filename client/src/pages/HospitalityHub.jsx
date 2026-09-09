import React, { useState } from 'react';
import { api, useApi } from '../api.js';
import { Hotel, Bus, Utensils, CheckCircle, ArrowRight, BarChart3, Users, Zap } from '../components/Icons.jsx';

export default function HospitalityHub() {
  const { data: zonesData, loading: loadingZones } = useApi(api.hospitalityZones);
  const { data: merchantsData } = useApi(api.hospitalityMerchants);

  const [activeTab, setActiveTab] = useState('zones'); // 'zones' or 'merchants'
  const [partnerEnrolled, setPartnerEnrolled] = useState(false);

  if (loadingZones || !zonesData) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="h-96 animate-pulse rounded-3xl bg-neutral-900/60 border border-neutral-800" />
      </div>
    );
  }

  const { zones } = zonesData;
  const merchants = merchantsData?.merchants || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8 fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Hotel className="h-4 w-4 text-emerald-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              Hospitality & Commercial Services Coordination
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Hospitality Partner Hub
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Synchronize accommodation room allotments, dynamic feeder shuttles, and post-event dining dispersal across the city.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#111114] border border-neutral-800 p-1 rounded-full">
          <button
            onClick={() => setActiveTab('zones')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              activeTab === 'zones' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Accommodation Zones ({zones.length})
          </button>
          <button
            onClick={() => setActiveTab('merchants')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              activeTab === 'merchants' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Dining Dispersal Partners ({merchants.length})
          </button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 shadow-xl">
          <div className="text-xs text-neutral-400 font-medium">Core Zone Saturation</div>
          <div className="mt-2 text-3xl font-black text-rose-400">95% Full</div>
          <p className="mt-1 text-xs text-neutral-500">Nerul Stadium proximity rooms exhausted</p>
        </div>

        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 shadow-xl">
          <div className="text-xs text-neutral-400 font-medium">Peripheral Capacity Absorption</div>
          <div className="mt-2 text-3xl font-black text-emerald-400">11,700 Rooms</div>
          <p className="mt-1 text-xs text-neutral-500">Available across Belapur, Kharghar & Panvel</p>
        </div>

        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-5 shadow-xl">
          <div className="text-xs text-neutral-400 font-medium">Post-Event Dispersal Absorption</div>
          <div className="mt-2 text-3xl font-black text-white">10,500 Pax</div>
          <p className="mt-1 text-xs text-neutral-500">Capacity to absorb stadium exit crowd</p>
        </div>
      </div>

      {/* Tab 1: Accommodation Zones */}
      {activeTab === 'zones' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {zones.map((zone) => {
              const isOverloaded = zone.occupancy_pct >= 90;
              const isRecommended = zone.is_overflow_recommended === 1;

              return (
                <div
                  key={zone.id}
                  className={`rounded-3xl border p-6 shadow-xl space-y-4 transition ${
                    isOverloaded
                      ? 'border-rose-500/30 bg-gradient-to-br from-[#141418] to-rose-950/10'
                      : isRecommended
                        ? 'border-emerald-500/30 bg-gradient-to-br from-[#141418] to-emerald-950/10'
                        : 'border-neutral-800 bg-[#111114]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isOverloaded
                            ? 'bg-rose-500/20 text-rose-400'
                            : isRecommended
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-neutral-800 text-neutral-300'
                        }`}>
                          {isOverloaded ? 'SATURATED CORE' : isRecommended ? 'RECOMMENDED OVERFLOW HUB' : 'BALANCED'}
                        </span>
                      </div>
                      <h3 className="mt-2 text-lg font-black text-white">{zone.name}</h3>
                      <p className="text-xs text-neutral-400 mt-1">{zone.transit_link_desc}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-white">{zone.occupancy_pct}%</div>
                      <div className="text-[10px] text-neutral-400">Occupancy</div>
                    </div>
                  </div>

                  {/* Room Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-neutral-400 mb-1">
                      <span>{zone.booked_rooms.toLocaleString('en-IN')} booked</span>
                      <span>{zone.available_rooms.toLocaleString('en-IN')} available</span>
                    </div>
                    <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          zone.occupancy_pct > 85 ? 'bg-rose-500' : zone.occupancy_pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${zone.occupancy_pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Price & Surge Details */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-800/80 text-xs">
                    <div>
                      <span className="text-neutral-400">Average Room Rate:</span>
                      <div className="font-bold text-white text-sm">₹{zone.avg_rate.toLocaleString('en-IN')}/night</div>
                    </div>
                    <div>
                      <span className="text-neutral-400">Surge Index:</span>
                      <div className={`font-bold text-sm ${zone.surge_multiplier > 1.3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {zone.surge_multiplier}x multiplier
                      </div>
                    </div>
                  </div>

                  {/* Partner Hotel Badges */}
                  {zone.hotels && zone.hotels.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] uppercase font-bold text-neutral-400">Partner Hotels in Zone</span>
                      <div className="flex flex-wrap gap-1.5">
                        {zone.hotels.map(h => (
                          <span key={h.id} className="rounded-lg bg-neutral-900 border border-neutral-800 px-2.5 py-1 text-[11px] text-neutral-300">
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
        </div>
      )}

      {/* Tab 2: Dining & Dispersal Partners */}
      {activeTab === 'merchants' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Post-Event Crowd Dispersal Program</h3>
              <p className="text-xs text-neutral-400">
                Partner venues offer event ticket holders exclusive discounts between 21:30 and 01:00 to delay exit surges and reduce platform and turnstile stampedes.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-2">
              {merchants.map((m) => (
                <div key={m.id} className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-full bg-violet-500/20 text-violet-300 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                        {m.category} · {m.zone}
                      </span>
                      <h4 className="mt-2 text-sm font-bold text-white">{m.name}</h4>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2.5 py-1 text-xs font-bold">
                      {m.discount_pct}% OFF
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400">{m.description}</p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/80">
                    <span className="text-neutral-400">Dispersal Delay: <strong>+{m.egress_delay_mins} mins</strong></span>
                    <span className="font-mono font-bold text-white bg-neutral-800 px-2 py-0.5 rounded">
                      VOUCHER: {m.voucher_code}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Partner Enrollment Banner */}
      <div className="rounded-3xl border border-neutral-800/80 bg-gradient-to-r from-neutral-900 to-[#141418] p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Join the Mega-Event Hospitality Alliance</h3>
          <p className="text-xs text-neutral-400 max-w-xl">
            Are you a hotelier or restaurant operator in MMR? Synchronize your real-time inventory with Stadia Nexus to receive guaranteed shuttle-connected tourist bookings.
          </p>
        </div>

        <button
          onClick={() => setPartnerEnrolled(true)}
          className="rounded-full bg-white px-6 py-2.5 text-xs font-bold text-black hover:bg-neutral-200 transition shrink-0"
        >
          {partnerEnrolled ? '✓ Partnership Request Logged' : 'Enroll Property'}
        </button>
      </div>
    </div>
  );
}
