'use client';

import React, { useState, useEffect } from 'react';
import { api, useApi } from '../../lib/api.js';
import { useRole } from '../../components/RoleContext.jsx';
import { Hotel, Bus, Utensils, CheckCircle, ArrowRight, BarChart3, Users, Zap, Ticket, Sparkles } from '../../components/Icons';

export default function HospitalityHubPage() {
  const { role } = useRole();
  const isFan = role === 'fan';

  const { data: zonesData, loading: loadingZones } = useApi(api.hospitalityZones);
  const { data: merchantsData } = useApi(api.hospitalityMerchants);

  const [activeTab, setActiveTab] = useState('zones'); // 'zones' or 'merchants'
  const [partnerEnrolled, setPartnerEnrolled] = useState(false);
  const [copiedVoucher, setCopiedVoucher] = useState(null);

  useEffect(() => {
    if (isFan) {
      setActiveTab('merchants');
    }
  }, [isFan]);

  if (loadingZones || !zonesData) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="h-96 animate-pulse rounded-3xl bg-neutral-900/60 border border-neutral-800" />
      </div>
    );
  }

  const zones = Array.isArray(zonesData) ? zonesData : (zonesData?.zones || []);
  const merchants = Array.isArray(merchantsData) ? merchantsData : (merchantsData?.merchants || []);

  const copyVoucher = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedVoucher(code);
    setTimeout(() => setCopiedVoucher(null), 2500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8 fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            {isFan ? (
              <Utensils className="h-4 w-4 text-emerald-400" />
            ) : (
              <Hotel className="h-4 w-4 text-emerald-400" />
            )}
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              {isFan ? 'Fan Matchday Perks & Post-Match Dispersal' : 'Hospitality & Commercial Services Coordination'}
            </span>
          </div>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {isFan ? 'Post-Match Perks, Dining & Fan Zones' : 'Hospitality Partner Hub'}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {isFan
              ? 'Present your digital matchday pass to claim 10%–20% discounts at official partner dining venues and fan parks while post-match highway traffic clears.'
              : 'Synchronize accommodation room allotments, dynamic feeder shuttles, and post-event dining dispersal across the city.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#111114] border border-neutral-800 p-1 rounded-full">
          <button
            onClick={() => setActiveTab('merchants')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              activeTab === 'merchants' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Dining & Perks ({merchants.length})
          </button>
          <button
            onClick={() => setActiveTab('zones')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              activeTab === 'zones' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Accommodation Zones ({zones.length})
          </button>
        </div>
      </div>

      {/* Fan Ingress Perk Callout if Fan Mode */}
      {isFan && (
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 to-neutral-900 p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Smart Crowd Dispersal Bonus</h3>
              <p className="text-xs text-neutral-300">
                Fans who relax at partner venues for 45+ minutes after full-time receive an additional ₹150 ride-hailing credit on Uber/Ola!
              </p>
            </div>
          </div>
          <button
            onClick={() => copyVoucher('STADIA-DISPERSE-150')}
            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-bold text-black transition"
          >
            {copiedVoucher === 'STADIA-DISPERSE-150' ? 'Voucher Copied!' : 'Copy Dispersal Voucher'}
          </button>
        </div>
      )}

      {/* KPI Overview (Organizer or Context) */}
      {!isFan && (
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
      )}

      {/* Tab: Dining & Dispersal Partners */}
      {activeTab === 'merchants' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Official Partner Dining & Fan Festivals</h3>
              <p className="text-xs text-neutral-400">
                Flash your digital matchday pass or use the verified voucher codes below to unlock exclusive discounts.
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

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-neutral-800/80">
                    <span className="text-neutral-400">Dispersal Window: <strong>+{m.egress_delay_mins} mins</strong></span>
                    <button
                      onClick={() => copyVoucher(m.voucher_code)}
                      className="font-mono text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-neutral-800 hover:bg-neutral-700 px-3 py-1 rounded-lg transition"
                    >
                      {copiedVoucher === m.voucher_code ? 'Copied!' : `CODE: ${m.voucher_code}`}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Accommodation Zones */}
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
                        : 'border-neutral-800 bg-[#141418]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{zone.zone_name}</span>
                        {isRecommended && (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            Recommended Overflow
                          </span>
                        )}
                        {isOverloaded && (
                          <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400">
                            Saturated
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">{zone.distance_km} km to DY Patil Stadium</p>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-white">{zone.occupancy_pct}%</div>
                      <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">Occupancy</div>
                    </div>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverloaded ? 'bg-rose-500' : isRecommended ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${zone.occupancy_pct}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-2.5">
                      <span className="text-neutral-400">Available Rooms:</span>
                      <p className="text-sm font-bold text-white mt-0.5">{zone.available_rooms?.toLocaleString() || zone.available_rooms}</p>
                    </div>
                    <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-2.5">
                      <span className="text-neutral-400">Surge Multiplier:</span>
                      <p className="text-sm font-bold text-white mt-0.5">{zone.surge_multiplier}x</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alliance Request Banner */}
      <div className="rounded-3xl border border-neutral-800/80 bg-gradient-to-r from-neutral-900 to-[#141418] p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Join the Mega-Event Hospitality Alliance</h3>
          <p className="text-xs text-neutral-400 max-w-xl">
            Are you a hotelier or restaurant operator in MMR? Synchronize your real-time inventory with Stadia Nexus to receive guaranteed shuttle-connected tourist bookings.
          </p>
        </div>

        <button
          onClick={() => setPartnerEnrolled(true)}
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-bold text-black hover:bg-neutral-200 transition shrink-0"
        >
          {partnerEnrolled ? (
            <>
              <CheckCircle className="h-3.5 w-3.5 text-black" />
              Partnership Request Logged
            </>
          ) : (
            'Enroll Property'
          )}
        </button>
      </div>
    </div>
  );
}
