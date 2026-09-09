'use client';

import React, { useState } from 'react';
import { Shield, Layers, Building, Train, Server, Activity, ArrowRight, CheckCircle2 } from './Icons';

export default function CompetitorBenchmark() {
  const [activeTab, setActiveTab] = useState('matrix'); // 'matrix' | 'architecture'

  const competitors = [
    {
      name: 'OnePlan Events',
      focus: 'Site Planning & CAD/GIS Layout',
      usedBy: 'Paris 2024 Olympics, Silverstone',
      crossAgency: false,
      realTimePMS: false,
      transitSCADA: false,
      automatedDispatch: false,
      verdict: 'Static spatial layout tool. Lacks live PMS room feeds, transit dispatch, and crowd redistribution.',
    },
    {
      name: 'Palantir Foundry',
      focus: 'Heavy Enterprise Data Ontology',
      usedBy: 'Defense, Gov Agencies, Conglomerates',
      crossAgency: true,
      realTimePMS: false,
      transitSCADA: false,
      automatedDispatch: false,
      verdict: 'Multi-million dollar custom deployment requiring months of bespoke engineering; not purpose-built for turnkey event operations.',
    },
    {
      name: 'CrowdVision / Beonic',
      focus: 'In-Venue LiDAR & Computer Vision',
      usedBy: 'Airports, Mega-Arenas, Theme Parks',
      crossAgency: false,
      realTimePMS: false,
      transitSCADA: false,
      automatedDispatch: false,
      verdict: 'Confined strictly to venue concourses and gates. Blind to macro-regional hotel exhaustion and transit chokepoints.',
    },
    {
      name: 'Lighthouse (OTA Insight)',
      focus: 'Hotel Revenue Management & Pricing',
      usedBy: 'Hotel Chains, Tourism Boards',
      crossAgency: false,
      realTimePMS: true,
      transitSCADA: false,
      automatedDispatch: false,
      verdict: 'Commercial rate optimization only. Zero link to stadium turnstile load or municipal shuttle fleet mobilization.',
    },
    {
      name: 'Stadia Nexus',
      focus: 'Cross-Sector Orchestration & Redistribution Layer',
      usedBy: 'Host Cities, Tournament Authorities & Tourism Consortia',
      crossAgency: true,
      realTimePMS: true,
      transitSCADA: true,
      automatedDispatch: true,
      highlight: true,
      verdict: 'Unified command layer connecting external ticketing (BookMyShow, FIFA TMS), hotel PMS, and transit SCADA in real time.',
    },
  ];

  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--terracotta-primary)]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
              Market Intelligence &amp; Segment Analysis
            </span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)] mt-1">
            Mega-Event Orchestration: Competitor Matrix
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            How Stadia Nexus bridges the critical functional gaps of siloed event GIS, venue LiDAR, and hotel RMS tools.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`btn-press rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'matrix'
                ? 'bg-[var(--terracotta-primary)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Capabilities Matrix
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`btn-press rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === 'architecture'
                ? 'bg-[var(--terracotta-primary)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Architectural Edge
          </button>
        </div>
      </div>

      {activeTab === 'matrix' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-mono text-[10px] uppercase tracking-wider">
                <th className="pb-3 pr-4">Platform</th>
                <th className="pb-3 pr-4">Primary Segment</th>
                <th className="pb-3 pr-3 text-center">Cross-Agency Ingestion</th>
                <th className="pb-3 pr-3 text-center">Live Hotel PMS</th>
                <th className="pb-3 pr-3 text-center">Transit SCADA</th>
                <th className="pb-3 pr-3 text-center">Autonomous Dispatch</th>
                <th className="pb-3 pl-3">Operational Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {competitors.map((c) => (
                <tr
                  key={c.name}
                  className={`transition-colors ${
                    c.highlight
                      ? 'bg-[var(--terracotta-soft)] font-medium'
                      : 'hover:bg-[var(--bg-elevated)]/60'
                  }`}
                >
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${c.highlight ? 'text-[var(--terracotta-primary)] font-mono' : 'text-[var(--text-primary)]'}`}>
                        {c.name}
                      </span>
                      {c.highlight && (
                        <span className="rounded-full bg-[var(--terracotta-primary)] px-1.5 py-0.5 text-[9px] font-mono text-white">
                          THIS APPLICATION
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">{c.usedBy}</div>
                  </td>
                  <td className="py-3.5 pr-4 text-[var(--text-secondary)]">{c.focus}</td>
                  <td className="py-3.5 pr-3 text-center">
                    <span className={`inline-block font-mono text-[11px] ${c.crossAgency ? 'text-[var(--terracotta-primary)] font-bold' : 'text-[var(--text-muted)]'}`}>
                      {c.crossAgency ? '✓ Unified' : '✗ Siloed'}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 text-center">
                    <span className={`inline-block font-mono text-[11px] ${c.realTimePMS ? 'text-[var(--terracotta-primary)] font-bold' : 'text-[var(--text-muted)]'}`}>
                      {c.realTimePMS ? '✓ Real-Time' : '✗ None'}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 text-center">
                    <span className={`inline-block font-mono text-[11px] ${c.transitSCADA ? 'text-[var(--terracotta-primary)] font-bold' : 'text-[var(--text-muted)]'}`}>
                      {c.transitSCADA ? '✓ GTFS-RT' : '✗ None'}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 text-center">
                    <span className={`inline-block font-mono text-[11px] ${c.automatedDispatch ? 'text-[var(--terracotta-primary)] font-bold' : 'text-[var(--text-muted)]'}`}>
                      {c.automatedDispatch ? '✓ Active Directives' : '✗ Manual'}
                    </span>
                  </td>
                  <td className="py-3.5 pl-3 text-[11px] text-[var(--text-secondary)] max-w-xs leading-relaxed">
                    {c.verdict}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 space-y-2">
            <div className="flex items-center gap-2 text-[var(--terracotta-primary)]">
              <Server className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">No Vendor Lock-In</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Unlike monolithic suites (Palantir), Stadia Nexus does not replace existing PMS or ticketing platforms. It acts as an open protocol bridge connecting BookMyShow, FIFA TMS, and Opera PMS via standard webhooks.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 space-y-2">
            <div className="flex items-center gap-2 text-[var(--terracotta-primary)]">
              <Train className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Macro-Regional Horizon</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Unlike venue-bound LiDAR systems (CrowdVision) that only see inside turnstiles, Stadia Nexus monitors the 50km metropolitan transit web, routing fans to peripheral hotels (Kharghar/Belapur) before bottlenecks form.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 space-y-2">
            <div className="flex items-center gap-2 text-[var(--terracotta-primary)]">
              <Shield className="h-4 w-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Actionable Directives</h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Unlike passive GIS planners (OnePlan), Nexus runs closed-loop intervention playbooks: triggering surge fare suppressions, mobilizing extra rail coaches, and redistributing turnstile queues autonomously.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
