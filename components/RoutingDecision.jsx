'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  Car, 
  Users, 
  Zap, 
  TrendingUp, 
  AlertCircle 
} from './Icons';

export default function RoutingDecision() {
  const [activeScenario, setActiveScenario] = useState('parking'); // 'parking' | 'gate' | 'hotel'

  const scenarios = {
    parking: {
      title: 'Dynamic Parking Surge Deconfliction',
      before: {
        target: 'Zone P3 (East Sector)',
        metric: '88% Capacity',
        detail: '1,420 / 1,600 stalls occupied · Gridlock imminent on Sion-Panvel feeder',
        status: 'critical',
      },
      decision: {
        action: 'Dynamic Traffic Divert via WhatsApp & Variable Message Signs (VMS)',
        reassigned: '620 Vehicles',
        targetTo: 'Parking P4 (South Sector, 60% Capacity)',
      },
      after: {
        target: 'Zone P3 Stabilized at 72%',
        metric: 'P4 Absorbed at 76%',
        detail: 'Average parking search time reduced from 24 mins to 3.5 mins',
        status: 'resolved',
      },
      roi: 'Zero spillover onto arterial highway · 14.8 tonnes CO2 saved from idling',
    },
    gate: {
      title: 'Predictive Gate Turnstile Balancing',
      before: {
        target: 'Gate C (East Concourse)',
        metric: '22 min Queue Time',
        detail: '14,200 ticket holders assigned · 38 turnstiles at 96% throughput',
        status: 'critical',
      },
      decision: {
        action: 'In-App Turnstile Fast-Track Reroute to Gate D & Gate B',
        reassigned: '3,800 Fans',
        targetTo: 'Gate D (Underutilized South Concourse)',
      },
      after: {
        target: 'Gate C Queue: 6 mins',
        metric: 'Gate D Throughput: 74%',
        detail: 'Even ingress distribution achieved 45 mins prior to kickoff',
        status: 'resolved',
      },
      roi: '100% on-time spectator stadium entry · Zero bottleneck crush points',
    },
    hotel: {
      title: 'Peripheral Lodging Absorption',
      before: {
        target: 'Core Stadium Hotels',
        metric: '94% Occupancy',
        detail: 'Severe price surge & shortage within 3km of DY Patil Stadium',
        status: 'critical',
      },
      decision: {
        action: 'Automated Tier-2 Peripheral Hotel Discovery + Dedicated Shuttles',
        reassigned: '2,740 Spectators',
        targetTo: '12 Peripheral Hotels in Vashi & Belapur + Express Shuttles',
      },
      after: {
        target: 'Citywide Absorption 82%',
        metric: '₹62.5L Partner Revenue',
        detail: '100% hotel room pickup with zero localized transit price gouging',
        status: 'resolved',
      },
      roi: 'Expanded hospitality footprint across Navi Mumbai with seamless shuttle sync',
    }
  };

  const current = scenarios[activeScenario];

  return (
    <div className="w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-7 shadow-soft space-y-6 transition-colors">
      
      {/* Header & Scenario Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[var(--terracotta-primary)] animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--terracotta-text)]">
              AUTONOMOUS DECONFLICTION ENGINE
            </span>
          </div>
          <h3 className="text-lg font-black text-[var(--text-primary)] font-mono">
            {current.title}
          </h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-1">
          <button
            onClick={() => setActiveScenario('parking')}
            className={`px-3 py-1 text-xs font-mono font-bold rounded transition ${
              activeScenario === 'parking' ? 'bg-[var(--terracotta-primary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Parking Surge
          </button>
          <button
            onClick={() => setActiveScenario('gate')}
            className={`px-3 py-1 text-xs font-mono font-bold rounded transition ${
              activeScenario === 'gate' ? 'bg-[var(--terracotta-primary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Gate Balancing
          </button>
          <button
            onClick={() => setActiveScenario('hotel')}
            className={`px-3 py-1 text-xs font-mono font-bold rounded transition ${
              activeScenario === 'hotel' ? 'bg-[var(--terracotta-primary)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Lodging Absorption
          </button>
        </div>
      </div>

      {/* 3-Stage Workflow Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        
        {/* Step 1: Bottleneck Detected */}
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-rose-600 dark:text-rose-400">
              01 · BOTTLENECK DETECTED
            </span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <h4 className="text-base font-black text-[var(--text-primary)] font-mono">
            {current.before.target}
          </h4>
          <div className="text-xl font-mono font-bold text-rose-600 dark:text-rose-400">
            {current.before.metric}
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {current.before.detail}
          </p>
        </div>

        {/* Step 2: System Decision */}
        <div className="relative rounded-xl border border-[var(--terracotta-border)] bg-[var(--terracotta-tint)] p-4 space-y-2 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-[var(--terracotta-text)]">
              02 · STADIA DECONFLICTION
            </span>
            <Zap className="w-4 h-4 text-[var(--terracotta-primary)]" />
          </div>
          <h4 className="text-sm font-bold text-[var(--text-primary)] font-mono leading-tight">
            {current.decision.action}
          </h4>
          <div className="text-xl font-mono font-bold text-[var(--terracotta-text)]">
            Diverted: {current.decision.reassigned}
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            → Destination: {current.decision.targetTo}
          </p>
        </div>

        {/* Step 3: Resolved Outcome */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
              03 · STEADY-STATE ACHIEVED
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <h4 className="text-base font-black text-[var(--text-primary)] font-mono">
            {current.after.target}
          </h4>
          <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {current.after.metric}
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {current.after.detail}
          </p>
        </div>
      </div>

      {/* Impact Metric Bar */}
      <div className="flex items-center gap-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3 text-xs font-mono text-[var(--text-secondary)]">
        <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div>
          <strong className="text-[var(--text-primary)]">OPERATIONAL ROI: </strong>
          <span>{current.roi}</span>
        </div>
      </div>
    </div>
  );
}
