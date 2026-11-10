'use client';

import React from 'react';
import { CheckCircle, AlertTriangle, Clock, Shield, Activity } from './Icons';

const LIFECYCLE_STAGES = [
  { id: 'detected', label: '1. Detected' },
  { id: 'assessed', label: '2. Assessed' },
  { id: 'recommendation', label: '3. AI Recommendation' },
  { id: 'assigned', label: '4. Assigned' },
  { id: 'action', label: '5. Action Taken' },
  { id: 'monitoring', label: '6. Monitoring' },
  { id: 'resolved', label: '7. Resolved' },
];

const DEFAULT_TIMELINE = [
  {
    id: 1,
    time: '18:34',
    title: 'Issue Resolved · Gate B Entry Normal & Smooth',
    description: 'Gate wait decreased from 14m to 7.8m. Gate B crowd stabilized at 65%.',
    severity: 'resolved',
    stage: 'resolved',
    role: 'AI State Engine',
  },
  {
    id: 2,
    time: '18:28',
    title: '1,200 Attendee Digital Passes Updated',
    description: 'Push notification & dynamic QR advisory delivered to Sector 14 / P2 local fans rerouting to Gate A.',
    severity: 'info',
    stage: 'action',
    role: 'Attendee Loop',
  },
  {
    id: 3,
    time: '18:27',
    title: 'Stadium Ops Approved Route Balancing',
    description: 'Operator approved crowd rerouting from Gate B (North-East) to Gate A (North Express).',
    severity: 'action',
    stage: 'assigned',
    role: 'Stadium Operations',
  },
  {
    id: 4,
    time: '18:26',
    title: 'AI Generated Explainable Recommendation',
    description: 'Identified Gate A with 32% available capacity to welcome 1,200 fans with 87% confidence.',
    severity: 'warning',
    stage: 'recommendation',
    role: 'Decision Engine',
  },
  {
    id: 5,
    time: '18:25',
    title: 'Gate B Overload Predicted (94% in 12m)',
    description: 'Arrival rate projected to exceed safe capacity of 1,500 fans/min along Route B.',
    severity: 'critical',
    stage: 'assessed',
    role: 'Prediction Engine',
  },
  {
    id: 6,
    time: '18:24',
    title: 'Sector 14 / P2 Parking Surge Detected',
    description: '3,840 fans arriving concurrently via local vehicular and rail approaches.',
    severity: 'warning',
    stage: 'detected',
    role: 'State Engine',
  },
];

export default function EventTimeline({ timeline = [], currentStage = 'resolved' }) {
  const events = timeline && timeline.length > 0 ? timeline : DEFAULT_TIMELINE;

  return (
    <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-400" />
            Event Incident Lifecycle & Chronological Audit Trail
          </h2>
          <p className="text-xs text-neutral-400">
            Sections 15 & 16 of Brief: End-to-end historical log from AI risk detection to attendee routing resolution.
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5" />
          Closed-Loop Verified
        </span>
      </div>

      {/* 7-Stage Incident Lifecycle Visualizer (Section 15 of Brief) */}
      <div className="rounded-2xl border border-neutral-800 bg-[#0e0e12] p-4">
        <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-3">
          Live Incident Timeline: Gate B Entry Bottleneck
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {LIFECYCLE_STAGES.map((s, idx) => (
            <div
              key={s.id}
              className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 px-2.5 py-2 text-center"
            >
              <div className="text-[10px] font-bold text-emerald-400 truncate">{s.label}</div>
              <div className="flex items-center justify-center gap-1 text-[9px] text-emerald-300/70 font-mono mt-0.5">
                <CheckCircle className="h-2.5 w-2.5" /> Complete
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chronological Audit Log */}
      <div className="space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Chronological Detection & Orchestration Stream
        </div>
        <div className="relative pl-6 border-l-2 border-neutral-800 space-y-6">
          {events.map((e) => {
            const isResolved = e.severity === 'resolved';
            const isCritical = e.severity === 'critical';
            const isWarning = e.severity === 'warning';
            return (
              <div key={e.id} className="relative group">
                {/* Node dot */}
                <span
                  className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-[#111114] ${
                    isResolved
                      ? 'bg-emerald-400 ring-2 ring-emerald-400/20'
                      : isCritical
                      ? 'bg-red-500 ring-2 ring-red-500/20'
                      : isWarning
                      ? 'bg-amber-400 ring-2 ring-amber-400/20'
                      : 'bg-neutral-400'
                  }`}
                />
                <div className="rounded-2xl border border-neutral-800/80 bg-[#0e0e12] p-4 transition hover:border-neutral-700">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">{e.time}</span>
                      <span className="text-xs font-bold text-white">{e.title}</span>
                    </div>
                    <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-400">
                      {e.role || 'Stadia Nexus'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-400 leading-relaxed">{e.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
