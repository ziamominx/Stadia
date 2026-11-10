'use client';

import React, { useState } from 'react';
import { Shield, ArrowRight, CheckCircle, AlertTriangle, Activity, Sliders, Zap } from './Icons';

export default function ExplainableRecommendation({ onApprove, isApproved }) {
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  if (dismissed) return null;

  return (
    <div className={`rounded-3xl border transition-all duration-300 p-5 shadow-2xl backdrop-blur-xl ${
      isApproved
        ? 'border-emerald-500/40 bg-emerald-950/20'
        : 'border-amber-500/40 bg-[#121217] hover:border-amber-500/60'
    }`}>
      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
            isApproved ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'
          }`}>
            {isApproved ? <CheckCircle className="h-4 w-4 text-black" /> : <Zap className="h-4 w-4 text-black" />}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                {isApproved ? 'Route Balancing Active' : 'Smart Route Recommendation'}
              </span>
              <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-400">
                Level 4 · Human Approval
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {isApproved ? 'Smart coordination active · Fan routes dynamically updated' : 'Crowd buildup detected · Gate B Entry Bottleneck'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-400">Confidence:</span>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-400">
            87% High
          </span>
        </div>
      </div>

      {/* The Core Proposal */}
      <div className="mt-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-black">
            !
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-snug">
              Recommended Action: Redirect 1,200 attendees from <span className="text-amber-400 font-mono">Gate B (North-East)</span> → <span className="text-emerald-400 font-mono">Gate A (North Express)</span>
            </h4>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              Automated entry balancing: Re-assign walking directions in fan passes, open extra North walkway entry gates, and send updates to Sector 14 / P2 arrivals.
            </p>
          </div>
        </div>
      </div>

      {/* Why? (Root Cause Analysis - Section 9 & 32 of brief) */}
      <div className="mt-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-3.5 space-y-2 text-xs">
        <div className="font-bold uppercase tracking-wider text-neutral-300 text-[11px] flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-neutral-400" /> Root Cause Analysis & Prediction
        </div>
        <ul className="space-y-1.5 text-neutral-400">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span><strong className="text-neutral-200">Predicted Gate Overload:</strong> Gate B current load is 82%, projected to reach <strong className="text-red-400">94% in 12 minutes</strong> exceeding safe entry gate speed.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span><strong className="text-neutral-200">Contributing Source:</strong> Parking Lot P2 (Sector 14) is at 88% capacity, contributing <strong className="text-neutral-200">3,840 approaching fans</strong> along Walkway B.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 font-bold">•</span>
            <span><strong className="text-neutral-200">Available Capacity:</strong> Gate A (North) currently operates at 68% with <strong className="text-emerald-400">32% open space</strong> and extra entry gates.</span>
          </li>
        </ul>
      </div>

      {/* Expected Impact (Before vs After Simulation) */}
      <div className="mt-4 grid grid-cols-3 gap-2.5 text-center text-xs">
        <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-2.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Gate B Load</span>
          <div className="mt-1 font-mono font-black text-sm text-emerald-400">
            {isApproved ? '65% (Optimal)' : '-23% (88% → 65%)'}
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-2.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Avg Gate Wait</span>
          <div className="mt-1 font-mono font-black text-sm text-emerald-400">
            {isApproved ? '8 min (Normal)' : '-6 min (14m → 8m)'}
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-2.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Walkway Congestion</span>
          <div className="mt-1 font-mono font-black text-sm text-emerald-400">
            {isApproved ? 'SMOOTH' : 'HIGH → SMOOTH'}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[11px] text-neutral-400">
          {isApproved ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle className="h-4 w-4" />
              Route updates applied to live stadium state. 1,200 fan passes updated.
            </span>
          ) : (
            <span>Authorizing will immediately balance gate lines and update fan tickets.</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isApproved ? (
            <>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
              >
                Dismiss / Override
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  await onApprove();
                  setLoading(false);
                }}
                className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-5 py-2 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition"
              >
                {loading ? 'Balancing Entry Flow...' : 'Approve & Reroute Fans'}
              </button>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-bold text-emerald-300 border border-emerald-500/40">
              <CheckCircle className="h-3.5 w-3.5" /> Active in Event State
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
