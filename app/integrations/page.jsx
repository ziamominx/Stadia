'use client';

import React, { useState } from 'react';
import { Server, Radio, ArrowRight } from '../../components/Icons';

export default function IntegrationsPage() {
  const [activeWebhook, setActiveWebhook] = useState(null);
  const [webhookLog, setWebhookLog] = useState([
    { id: 1, source: 'BookMyShow', event: 'TICKET_BATCH_RESERVED', count: '450 tickets (Zone C)', time: '12s ago', status: '200 OK' },
    { id: 2, source: 'MMRDA Transit', event: 'METRO_TELEMETRY_PULSE', count: 'Line 1 load at 68%', time: '24s ago', status: '200 OK' },
    { id: 3, source: 'Hotel PMS Bridge', event: 'ROOM_ALLOTMENT_UPDATE', count: 'Kharghar +200 rooms released', time: '48s ago', status: '200 OK' },
    { id: 4, source: 'FIFA TMS', event: 'MATCH_TIMETABLE_SYNC', count: 'Kickoff verified 19:30 IST', time: '1m ago', status: '200 OK' },
  ]);

  const simulateWebhook = (source, event, count) => {
    setActiveWebhook(source);
    setTimeout(() => {
      setWebhookLog(prev => [
        {
          id: Date.now(),
          source,
          event,
          count,
          time: 'Just now',
          status: '200 OK'
        },
        ...prev.slice(0, 7)
      ]);
      setActiveWebhook(null);
    }, 600);
  };

  const connectors = [
    {
      id: 'bookmyshow',
      name: 'BookMyShow Enterprise Gateway',
      domain: 'Primary Ticketing Partner',
      type: 'REST Webhook Ingestion',
      status: 'ONLINE',
      syncInterval: 'Real-time Push',
      description: 'Ingests seat reservation blocks and pushes dynamic entry turnstile assignments to mobile ticket holders.',
      payloadSample: '{ "ticketId": "FWC-102-G4", "assignedGate": "Gate A · North", "transitHint": "Sector 14 Rail" }'
    },
    {
      id: 'fifa_tms',
      name: 'FIFA Central Match Management System',
      domain: 'Tournament Governing Body',
      type: 'GraphQL Sync',
      status: 'ONLINE',
      syncInterval: 'Every 30s',
      description: 'Synchronizes official match schedules, weather delays, and stadium perimeter security alerts.',
      payloadSample: '{ "matchId": 1, "status": "scheduled", "kickoff": "2026-10-12T19:30:00Z" }'
    },
    {
      id: 'hotel_pms',
      name: 'MMR Hospitality Consortium PMS Bridge',
      domain: 'Regional Accommodation Network',
      type: 'Two-Way XML / PMS Bridge',
      status: 'ONLINE',
      syncInterval: 'Every 15s',
      description: 'Monitors real-time hotel room availability across 5 city zones and releases overflow room buffers when core hotels saturate.',
      payloadSample: '{ "zone": "KHARGHAR_GREEN", "availableRooms": 3410, "surgeIndex": 0.95 }'
    },
    {
      id: 'mmrda_transit',
      name: 'MMRDA Intelligent Transportation & Metro SCADA',
      domain: 'Municipal Transit Authority',
      type: 'GTFS-RT / SCADA Stream',
      status: 'ONLINE',
      syncInterval: 'Sub-second Telemetry',
      description: 'Monitors highway toll plaza throughput, suburban rail platform density, and autonomous feeder shuttle loops.',
      payloadSample: '{ "corridor": "METRO_LINE_1", "capacityPerHour": 18000, "currentLoadPct": 68 }'
    }
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8 fade-in">
      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] pb-6 space-y-1">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-[var(--terracotta-primary)]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)]">
            Multi-Agency API &amp; Webhook Hub
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
          Third-Party Agency Connectors
        </h1>
        <p className="text-xs text-[var(--text-secondary)] max-w-2xl">
          All ticket sales, room reservations, and transit ticketing are handled by licensed external agencies. Nexus Command ingests their telemetry to orchestrate city capacity.
        </p>
      </div>

      {/* Connectors Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {connectors.map(conn => (
          <div
            key={conn.id}
            className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[var(--terracotta-primary)] font-semibold">{conn.domain}</span>
                <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight mt-0.5">{conn.name}</h3>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-0.5 text-[10px] font-mono text-[var(--text-secondary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--terracotta-primary)] animate-pulse" />
                {conn.status}
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{conn.description}</p>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 font-mono text-[11px] text-[var(--text-primary)] overflow-x-auto">
              <span className="text-[var(--text-muted)] block text-[9px] uppercase mb-1">Normalized Ingestion Telemetry</span>
              <code>{conn.payloadSample}</code>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs">
              <span className="text-[var(--text-muted)] font-mono text-[10px]">Protocol: {conn.type}</span>
              <button
                disabled={activeWebhook === conn.id}
                onClick={() => simulateWebhook(conn.name, 'TELEMETRY_INGESTION_PULSE', 'Simulated 200 payload records')}
                className="btn-press rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-1 text-[11px] font-medium text-[var(--text-primary)] hover:border-[var(--terracotta-primary)] hover:text-[var(--terracotta-primary)] shadow-sm"
              >
                {activeWebhook === conn.id ? 'Ingesting...' : 'Test Ingestion Webhook'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Ingestion Webhook Stream */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-[var(--terracotta-primary)]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Live Ingestion Event Stream
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">AUDIT LOG</span>
        </div>

        <div className="divide-y divide-[var(--border-subtle)] text-xs">
          {webhookLog.map(item => (
            <div key={item.id} className="py-2.5 flex items-center justify-between font-mono text-[11px]">
              <div className="flex items-center gap-3">
                <span className="text-[var(--text-primary)] font-medium w-36">{item.source}</span>
                <span className="text-[var(--text-secondary)]">{item.event}</span>
                <span className="text-[var(--text-muted)] hidden sm:inline">({item.count})</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[var(--terracotta-primary)] border border-[var(--border-subtle)] bg-[var(--terracotta-soft)] px-1.5 py-0.5 rounded text-[10px] font-semibold">{item.status}</span>
                <span className="text-[var(--text-muted)] text-[10px]">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
