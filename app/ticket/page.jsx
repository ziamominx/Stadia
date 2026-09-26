'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Ticket, CheckCircle, ArrowRight, Sparkles, MapPin, QrCode } from '@/components/Icons';

const SAMPLE_TICKETS = [
  {
    id: 'DEMO-TKT-01',
    match: 'India vs Australia — World Cup 2026',
    date: '28 Sep 2026 · 19:30 IST',
    venue: 'Mumbai International Stadium',
    gate: 'Gate A (West Grandstand)',
    sector: 'Sector A12',
    row: 'Row 18',
    seat: 'Seat 24',
    tier: 'VIP Pavilion',
    status: 'ACTIVE / VERIFIED',
    qrToken: '0x9f4a82c1_STADIA_PASS',
  },
  {
    id: 'DEMO-TKT-02',
    match: 'England vs Spain — Quarter Final',
    date: '02 Oct 2026 · 20:00 IST',
    venue: 'Mumbai International Stadium',
    gate: 'Gate 2 (East Concourse)',
    sector: 'Sector E04',
    row: 'Row 12',
    seat: 'Seat 08',
    tier: 'Category 1 General',
    status: 'ACTIVE',
    qrToken: '0x7e1b93f4_STADIA_PASS',
  },
];

export default function TicketWalletPage() {
  const [ticketInput, setTicketInput] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(SAMPLE_TICKETS[0]);
  const [nfcPulsing, setNfcPulsing] = useState(false);

  const handleSimulateScan = () => {
    setNfcPulsing(true);
    setTimeout(() => setNfcPulsing(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 fade-up">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <Ticket className="h-4 w-4" />
            <span>Digital Credential Wallet</span>
          </div>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
            Matchday Pass & NFC Turnstile Access
          </h1>
          <p className="mt-2 text-sm text-neutral-400 max-w-xl">
            Your cryptographic STADIA credential validates gate turnstiles, provides in-seat corridor directions,
            and coordinates seamless post-match return transit.
          </p>
        </div>

        {/* Quick Ticket ID Lookup Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter Ticket ID (e.g. DEMO-TKT-01)"
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value)}
            className="bg-[#111114] border border-neutral-800 px-3 py-2 text-xs text-white rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
          />
          <Link
            href={ticketInput ? `/ticket/${encodeURIComponent(ticketInput)}` : '#'}
            className="bg-white text-black font-semibold text-xs px-4 py-2 rounded-lg hover:bg-neutral-200 transition"
          >
            Lookup ↗
          </Link>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Left Column: Interactive Digital Pass Card */}
        <div className="lg:col-span-7">
          <div className="relative rounded-3xl border border-neutral-700 bg-gradient-to-b from-[#18181c] to-[#0c0c0e] p-8 shadow-2xl overflow-hidden">
            
            {/* Holographic glowing scan line effect */}
            {nfcPulsing && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent pointer-events-none animate-pulse" />
            )}

            {/* Pass Header */}
            <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                  OFFICIAL ACCESS CREDENTIAL
                </span>
                <div className="text-xl font-black text-white mt-1">STADIA PASS</div>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[11px] font-mono font-bold text-emerald-400">
                {selectedTicket.status}
              </span>
            </div>

            {/* Match Information */}
            <div className="py-6 border-b border-neutral-800">
              <span className="text-xs font-semibold text-emerald-400">MATCH FIXTURE</span>
              <h2 className="text-xl font-extrabold text-white mt-1">{selectedTicket.match}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-neutral-300">
                <span>🗓 {selectedTicket.date}</span>
                <span>📍 {selectedTicket.venue}</span>
              </div>
            </div>

            {/* Seat & Sector Grid */}
            <div className="py-6 border-b border-neutral-800 grid grid-cols-4 gap-4 text-center">
              <div className="bg-black/40 border border-neutral-800 p-3 rounded-2xl">
                <span className="text-[10px] text-neutral-400 block font-mono">GATE</span>
                <span className="text-base font-extrabold text-white mt-1 block">A</span>
              </div>
              <div className="bg-black/40 border border-neutral-800 p-3 rounded-2xl">
                <span className="text-[10px] text-neutral-400 block font-mono">SECTOR</span>
                <span className="text-base font-extrabold text-white mt-1 block">{selectedTicket.sector}</span>
              </div>
              <div className="bg-black/40 border border-neutral-800 p-3 rounded-2xl">
                <span className="text-[10px] text-neutral-400 block font-mono">ROW</span>
                <span className="text-base font-extrabold text-white mt-1 block">{selectedTicket.row}</span>
              </div>
              <div className="bg-black/40 border border-neutral-800 p-3 rounded-2xl">
                <span className="text-[10px] text-neutral-400 block font-mono">SEAT</span>
                <span className="text-base font-extrabold text-white mt-1 block">{selectedTicket.seat}</span>
              </div>
            </div>

            {/* QR / NFC Action Bar */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white p-1 rounded-xl flex items-center justify-center">
                  <div className="w-full h-full bg-neutral-900 rounded-lg flex items-center justify-center font-mono text-[9px] font-bold text-white text-center">
                    QR SECURE
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 block">TOKEN HASH</span>
                  <span className="text-xs font-mono text-white">{selectedTicket.qrToken}</span>
                </div>
              </div>

              <button
                onClick={handleSimulateScan}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-5 py-3 rounded-xl transition shadow-lg shadow-emerald-500/20"
              >
                {nfcPulsing ? '✓ Turnstile Scanned!' : '⚡ Simulate Turnstile Tap'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Selector & Wayfinding */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-[#111114] p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Demo Sample Passes
            </h3>
            <div className="space-y-3">
              {SAMPLE_TICKETS.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    selectedTicket.id === t.id
                      ? 'border-emerald-500/60 bg-emerald-500/10'
                      : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">{t.id}</span>
                    <span className="text-[10px] font-mono text-emerald-400">{t.tier}</span>
                  </div>
                  <div className="text-xs text-neutral-300 mt-1 font-semibold">{t.match}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    {t.sector} · {t.row} · {t.seat}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Wayfinding Actions */}
          <div className="rounded-2xl border border-neutral-800 bg-[#111114] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Connected Matchday Services
            </h3>
            <div className="space-y-2">
              <Link
                href="/fan"
                className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 hover:border-neutral-700 bg-neutral-900/30 text-xs text-neutral-300 hover:text-white transition"
              >
                <span>Live Stadium Directions & PA Alerts</span>
                <ArrowRight className="h-4 w-4 text-emerald-400" />
              </Link>
              <Link
                href="/hospitality-hub"
                className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 hover:border-neutral-700 bg-neutral-900/30 text-xs text-neutral-300 hover:text-white transition"
              >
                <span>Post-Match Dining Perks (-15%)</span>
                <ArrowRight className="h-4 w-4 text-emerald-400" />
              </Link>
              <Link
                href="/command-center"
                className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 hover:border-neutral-700 bg-neutral-900/30 text-xs text-neutral-300 hover:text-white transition"
              >
                <span>Venue Operations Platform</span>
                <ArrowRight className="h-4 w-4 text-emerald-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
