'use client';

// components/OpsShell.jsx — the shared command shell from the stitch headers:
// STADIA wordmark + live match context + 7-tab nav + status pill + IST clock
// + broadcast + signed-in director. Zero-radius, hairline, editorial.

import React, { useEffect, useState } from 'react';
import { useEventState } from '../lib/useEventState';
import { Toast } from './ui';

const NAV = [
  { to: '/command-center', label: 'Command Center' },
  { to: '/crowd', label: 'Crowd' },
  { to: '/ground', label: 'Ground' },
  { to: '/transport', label: 'Transport' },
  { to: '/incidents', label: 'Incidents' },
  { to: '/event-control', label: 'Event Control' },
  { to: '/analytics', label: 'Analytics' },
];

const ROLES = [
  { id: 'executive', name: 'E. Vance', title: 'Executive Dir.' },
  { id: 'ground', name: 'M. Okafor', title: 'Ground & Crowd Dir' },
  { id: 'transport', name: 'R. Iyer', title: 'Transport & Mobility Dir' },
];

function istClock() {
  const d = new Date(Date.now() + (5.5 * 60 + new Date().getTimezoneOffset()) * 60000);
  return d.toTimeString().slice(0, 8);
}

export default function OpsShell({ children }) {
  const { state, toast, setToast } = useEventState();
  const [path, setPath] = useState('/command-center');
  const [role, setRole] = useState('executive');
  const [now, setNow] = useState('');
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [bcText, setBcText] = useState('');

  useEffect(() => { setPath(window.location.pathname); }, []);
  useEffect(() => {
    const iv = setInterval(() => setNow(istClock()), 1000);
    setNow(istClock());
    return () => clearInterval(iv);
  }, []);

  const roleCfg = ROLES.find((r) => r.id === role) || ROLES[0];
  const ev = state?.event;
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="fixed top-0 left-0 w-full z-50 bg-canvas hairline-b" style={{ height: 64 }}>
        <div className="h-16 w-full px-4 flex items-center justify-between gap-4">
          {/* Brand + event context */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold uppercase tracking-wider text-[18px]">STADIA</span>
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-signal opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-signal" />
              </span>
            </div>
            <div className="h-4 w-px bg-hairline" />
            <div className="hidden md:flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-medium truncate max-w-xs">{ev ? `${ev.name}` : '—'}</span>
                <span className="font-mono text-[12px] text-on-surface-variant">{ev ? `— ${ev.venue}` : ''}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-signal" />
                <span className="uppercase tracking-wider text-[10px] font-semibold text-signal-deep">LIVE</span>
                <span className="font-mono text-[12px] text-on-surface-variant">{ev ? `· ${ev.date} · ${ev.kickoff}` : ''}</span>
              </div>
            </div>
          </div>

          {/* 7-tab nav */}
          <nav className="hidden xl:flex items-center h-full gap-0.5">
            {NAV.map((n) => {
              const active = path === n.to || (n.to !== '/command-center' && path.startsWith(n.to));
              return (
                <a key={n.to} href={n.to}
                  className={`h-full px-4 flex items-center uppercase tracking-wider text-[10px] font-semibold transition-colors border-b-2 ${
                    active ? 'text-ink border-ink bg-sc-low' : 'text-on-surface-variant border-transparent hover:text-ink'}`}>
                  {n.label}
                </a>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden md:flex items-center gap-1.5 hairline px-2 py-1 bg-sc-lowest"
              style={{ border: '1px solid var(--color-hairline)' }}>
              <span className={`h-1.5 w-1.5 rounded-full ${ev?.status === 'EMERGENCY' ? 'bg-critical' : 'bg-signal'}`} />
              <span className={`uppercase tracking-wider text-[10px] font-semibold ${ev?.status === 'EMERGENCY' ? 'text-critical-deep' : 'text-signal-deep'}`}>
                {ev?.status === 'EMERGENCY' ? 'EMERGENCY MODE' : 'OPERATIONAL'}
              </span>
            </div>
            <div className="hidden lg:flex items-center font-mono text-[12px] bg-sc-low px-2 py-1" style={{ border: '1px solid var(--color-hairline)' }}>
              <span className="text-on-surface-variant mr-1">UTC+5:30</span>
              <span className="tnum">{now} IST</span>
            </div>
            <button
              onClick={() => setBroadcastOpen((v) => !v)}
              className="flex items-center gap-1 h-8 px-2 bg-ink text-canvas uppercase tracking-wider text-[10px] font-semibold hover:bg-action-hover transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" /></svg>
              <span className="hidden sm:inline">Broadcast</span>
            </button>
            <div className="flex items-center gap-1.5 pl-2 hairline-l">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                aria-label="Viewing as"
                className="bg-transparent text-[10px] uppercase tracking-wider font-semibold cursor-pointer outline-none">
                {ROLES.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
              <div className="w-8 h-8 bg-ink flex items-center justify-center text-canvas text-[13px] font-medium">
                {roleCfg.name.split(' ').map((p) => p[0]).join('')}
              </div>
            </div>
          </div>
        </div>
        {/* Broadcast tray */}
        {broadcastOpen && (
          <div className="absolute right-4 top-16 bg-sc-lowest p-3 flex gap-2 items-center" style={{ border: '1px solid var(--color-hairline)' }}>
            <input
              value={bcText}
              onChange={(e) => setBcText(e.target.value)}
              placeholder="PA message to all zones…"
              className="h-8 px-2 bg-sc-lowest outline-none text-[13px] w-72"
              style={{ border: '1px solid var(--color-hairline)' }} />
            <button
              onClick={() => { if (bcText.trim()) { fetch('/api/actions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'broadcast', message: bcText.trim() }) }); setBcText(''); setBroadcastOpen(false); } }}
              className="h-8 px-3 bg-ink text-canvas uppercase tracking-wider text-[10px] font-semibold">
              Send
            </button>
          </div>
        )}
      </header>
      {/* hc002 demo-hint strip */}
      <div className="flex items-center justify-between px-7 py-1.5 text-[10px]"
        style={{ background: '#eaf0e7', color: '#53604f' }}>
        <span><strong className="text-[9px] tracking-[0.075em] mr-3 uppercase">DEMO</strong>Simulation runs on synthetic telemetry — every module below reads one shared event state.</span>
        <span className="hidden md:inline font-mono text-[9px]">TICK {state?.event?.tick ?? 0}</span>
      </div>
      <main className="pt-16 min-h-screen bg-canvas-recessed">{children}</main>
      <Toast message={toast} onClose={() => setToast('')} />
      {/* Mobile nav fallback */}
      <nav className="xl:hidden fixed bottom-0 left-0 w-full z-50 bg-canvas hairline-t flex">
        {NAV.map((n) => {
          const active = path === n.to;
          return (
            <a key={n.to} href={n.to}
              className={`flex-1 py-2.5 text-center text-[9px] uppercase tracking-wider font-semibold ${active ? 'text-ink' : 'text-on-surface-variant'}`}>
              {n.label.split(' ')[0]}
            </a>
          );
        })}
      </nav>
      <div className="xl:hidden h-12" />
    </div>
  );
}
