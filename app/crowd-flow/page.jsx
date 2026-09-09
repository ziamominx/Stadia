'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { 
  Shield, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Zap, 
  RefreshCw, 
  Server, 
  Activity, 
  Car, 
  Bus,
  ArrowRight,
  Filter
} from '../../components/Icons';

const CrowdFlowMapVisual = dynamic(() => import('../../components/CrowdFlowMapVisual'), {
  ssr: false,
  loading: () => (
    <div className="h-[540px] w-full rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] animate-pulse flex items-center justify-center font-mono text-xs text-[var(--text-muted)]">
      INITIALIZING HIGH-PRECISION GEOSPATIAL CORRIDOR ENGINE...
    </div>
  ),
});

export default function CrowdFlowPage() {
  const [timelineMinute, setTimelineMinute] = useState(60);
  const [flowData, setFlowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [deconflictionTriggered, setDeconflictionTriggered] = useState(false);

  const [telemetryLogs, setTelemetryLogs] = useState([
    { time: '17:28:44', source: 'FIFA TMS', msg: '12,480 foreign fan passes synced with DY Patil concourse' },
    { time: '17:29:10', source: 'MMRDA METRO', msg: 'Train #HB-204 departed Vashi · 920 passengers inbound' },
    { time: '17:29:35', source: 'BOOKMYSHOW', msg: '38,214 tickets validated · 0 double-scans detected' },
    { time: '17:30:02', source: 'HOTEL PMS', msg: 'Shuttle Convoy #3 dispatched from Radisson Blu Belapur' },
  ]);

  const fetchFlow = async (minutes) => {
    try {
      const res = await fetch(`/api/dashboard/flow?time=${minutes}`);
      if (res.ok) {
        const data = await res.json();
        setFlowData(data);
        if (data.mixingPoints?.length > 0) {
          setSelectedPoint(data.mixingPoints[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load crowd flow:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlow(timelineMinute);
  }, [timelineMinute]);

  const timelineLabels = [
    { min: 180, label: 'T-3H (Gates Open)' },
    { min: 120, label: 'T-2H (Early Ingress)' },
    { min: 60,  label: 'T-1H (Peak Ingress)' },
    { min: 30,  label: 'T-30M (Surge Window)' },
    { min: 0,   label: 'KICKOFF' },
  ];

  const mixingPoints = flowData?.mixingPoints || [];
  const segments = flowData?.segments || [];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans transition-colors">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-8 space-y-6 pb-24">
        
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--terracotta-primary)] animate-ping" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--terracotta-text)]">
                GEOSPATIAL PEDESTRIAN FLOW &amp; DECONFLICTION
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] font-mono tracking-tight">
              Crowd Flow Map &amp; Mixing-Point Radar
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-[var(--terracotta-text)] font-semibold">
              <span className="h-2 w-3 rounded bg-[var(--terracotta-primary)]" />
              <span>Local Commuter Paths</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
              <span className="h-2 w-3 rounded bg-amber-500 border-dashed" />
              <span>Outstation Shuttle Paths</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span>Collision Risk Node</span>
            </div>
          </div>
        </div>

        {/* ─── TIMELINE SLIDER STRIP (T-3H TO KICKOFF) ─── */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--text-primary)] shrink-0">
            <Clock className="w-4 h-4 text-[var(--terracotta-primary)]" />
            <span>INGRESS TIMELINE:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {timelineLabels.map((t) => (
              <button
                key={t.min}
                onClick={() => setTimelineMinute(t.min)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition whitespace-nowrap ${
                  timelineMinute === t.min
                    ? 'bg-[var(--terracotta-primary)] text-white shadow-soft'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-mono text-[var(--text-secondary)] shrink-0">
            Flow Fraction: <strong className="text-[var(--terracotta-text)]">{Math.round((flowData?.fraction || 0.45) * 100)}% active</strong>
          </div>
        </div>

        {/* ─── MAIN MAP & DECONFLICTION GRID ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Map Viewport (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-soft border border-[var(--border-subtle)]">
              <CrowdFlowMapVisual
                segments={segments}
                mixingPoints={mixingPoints}
                selectedPoint={selectedPoint}
                onSelectPoint={(pt) => setSelectedPoint(pt)}
              />

              {/* Floating Quick Stats on Map */}
              <div className="absolute top-4 left-4 z-[400] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 backdrop-blur-md p-3 text-xs font-mono space-y-1 shadow-soft">
                <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>DY PATIL ARENA PRECINCT</span>
                </div>
                <div className="text-[var(--text-secondary)] text-[11px]">
                  Active Ingress Segments: <span className="text-[var(--text-primary)] font-bold">{segments.length}</span>
                </div>
                <div className="text-[var(--text-secondary)] text-[11px]">
                  Mixing Points Detected: <span className="text-rose-600 dark:text-rose-400 font-bold">{mixingPoints.length}</span>
                </div>
              </div>
            </div>

            {/* Mixing Point Deconfliction Alert Card */}
            {mixingPoints.length > 0 && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-500 animate-bounce" />
                    <h3 className="text-sm font-black text-[var(--text-primary)] font-mono">
                      FEATURE: MIXING-POINT COLLISION WARNING
                    </h3>
                  </div>
                  <span className="rounded bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[10px] font-mono font-bold px-2 py-0.5 border border-rose-500/30">
                    SEPARATION: {selectedPoint?.distanceM || 134} METERS
                  </span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed">
                  {selectedPoint?.note || 'Local parking pedestrian path and outstation shuttle approach within 134 m — flag for marshalling barriers.'}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-rose-500/20 text-xs font-mono">
                  <div className="text-[var(--text-muted)] text-[11px]">
                    Affected: <strong>{selectedPoint?.localPath}</strong> vs <strong>{selectedPoint?.outstationPath}</strong>
                  </div>

                  <button
                    onClick={() => {
                      setDeconflictionTriggered(true);
                      setTimeout(() => setDeconflictionTriggered(false), 4000);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 text-xs transition active:scale-95 shadow-soft whitespace-nowrap"
                  >
                    <Zap className="w-3.5 h-3.5 text-white" />
                    <span>{deconflictionTriggered ? 'BARRIERS DEPLOYED (SAFE)' : 'Execute Marshalling Deconfliction'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Third-Party Telemetry Bridge & Routing Intelligence (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Third-Party Telemetry Bridge Feature Card */}
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4 shadow-soft">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-[var(--terracotta-primary)]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono">
                    Third-Party Telemetry Bridge
                  </h3>
                </div>
                <span className="rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[9px] font-mono font-bold px-1.5 py-0.5">
                  4 ONLINE
                </span>
              </div>

              {/* Connected APIs */}
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                  <div>
                    <div className="text-[var(--text-primary)] font-bold">BookMyShow Webhook</div>
                    <div className="text-[10px] text-[var(--text-muted)]">Ticketing QR Validation Engine</div>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">38ms · 99.8%</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                  <div>
                    <div className="text-[var(--text-primary)] font-bold">FIFA TMS Gateway</div>
                    <div className="text-[10px] text-[var(--text-muted)]">International Member Pass Node</div>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">ACTIVE</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                  <div>
                    <div className="text-[var(--text-primary)] font-bold">Opera Hotel PMS</div>
                    <div className="text-[10px] text-[var(--text-muted)]">12 Peripheral Lodging Feeds</div>
                  </div>
                  <span className="text-[var(--terracotta-text)] font-bold text-[11px]">2,743 RMS</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                  <div>
                    <div className="text-[var(--text-primary)] font-bold">MMRDA Transit Feed</div>
                    <div className="text-[10px] text-[var(--text-muted)]">Harbour Line &amp; Metro Telemetry</div>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">LIVE SYNC</span>
                </div>
              </div>

              {/* Live Webhook Log Stream */}
              <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5">
                <span className="text-[10px] font-mono text-[var(--text-muted)] block uppercase font-semibold">
                  Real-time Ingestion Activity
                </span>
                <div className="rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-2.5 space-y-1 font-mono text-[10px] max-h-36 overflow-y-auto">
                  {telemetryLogs.map((log, i) => (
                    <div key={i} className="text-[var(--text-secondary)] leading-tight">
                      <span className="text-[var(--terracotta-text)] font-semibold">{log.time}</span> <span className="text-[var(--text-muted)]">[{log.source}]</span> {log.msg}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ingress Balancing Action Card */}
            <div className="rounded-xl border border-[var(--terracotta-border)] bg-[var(--terracotta-tint)] p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--terracotta-text)]">
                <Zap className="w-4 h-4 text-[var(--terracotta-primary)]" />
                <span>DYNAMIC TRAFFIC DIVERSION</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                Parking P3 at <strong>88% capacity</strong>. 620 vehicles successfully reassigned to Zone P4. VMS expressway guidance boards operational.
              </p>
              <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                ✓ 18 MINS ESTIMATED COMMUTE SAVINGS PER FAN
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
