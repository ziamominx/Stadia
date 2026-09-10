'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import QRCode from 'qrcode';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import JourneyTimeline from '../../../components/JourneyTimeline';
import { 
  Ticket, 
  Shield, 
  Calendar, 
  Clock, 
  MapPin, 
  Car, 
  Bus, 
  Hotel, 
  Users, 
  CheckCircle2, 
  ArrowLeft,
  Navigation,
  QrCode as QrIcon,
  Download
} from '../../../components/Icons';

const TicketRouteMap = dynamic(() => import('../../../components/TicketRouteMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[340px] w-full rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] animate-pulse flex items-center justify-center font-mono text-xs text-[var(--text-muted)]">
      LOADING GEOSPATIAL INGRESS ROUTE...
    </div>
  ),
});

export default function DigitalTicketPage() {
  const params = useParams();
  const ticketId = params.ticketId;

  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadTicket() {
      try {
        const res = await fetch(`/api/bookings/${ticketId}`);
        if (res.ok) {
          const data = await res.json();
          setTicketData(data);

          const qrCodeUrl = await QRCode.toDataURL(
            `STADIA-PASS:${data.ticket?.unique_ticket_id || ticketId}|MATCH:${data.match?.id}|SEAT:${data.ticket?.seat_number}`,
            {
              width: 280,
              margin: 1,
              color: {
                dark: '#1c1917',
                light: '#ffffff',
              },
            }
          );
          setQrDataUrl(qrCodeUrl);
        }
      } catch (err) {
        console.error('Error loading ticket:', err);
      } finally {
        setLoading(false);
      }
    }
    if (ticketId) {
      loadTicket();
    }
  }, [ticketId]);

  const copyTicketId = () => {
    if (ticketData?.ticket?.unique_ticket_id) {
      navigator.clipboard.writeText(ticketData.ticket.unique_ticket_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-mono">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full py-20 px-4 text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--terracotta-tint)] text-[var(--terracotta-primary)] mx-auto animate-spin">
            <Ticket className="w-6 h-6" />
          </div>
          <p className="text-sm text-[var(--text-muted)]">Retrieving encrypted matchday pass from DY Patil node...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!ticketData) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-mono">
        <Navbar />
        <main className="flex-1 max-w-lg mx-auto w-full py-24 px-4 text-center space-y-4">
          <Ticket className="w-12 h-12 text-[var(--text-muted)] opacity-50 mx-auto" />
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Ticket Not Found</h2>
          <p className="text-xs text-[var(--text-muted)]">No ticket with ID &ldquo;{ticketId}&rdquo; was found in the central ledger.</p>
          <Link href="/matches" className="inline-block rounded-lg bg-[var(--terracotta-primary)] text-white px-4 py-2 text-xs font-bold shadow-soft">
            Browse Fixtures
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const { ticket, match, block, user, entryGate, exitGate, parkingZone, hotel, shuttle, route } = ticketData;

  const dateObj = match ? new Date(match.kickoff_time) : new Date();
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans transition-colors">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full py-8 space-y-8 pb-24">
        
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <Link
            href="/matches"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--terracotta-primary)] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Matches</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              LIVE DIGITAL MATCHDAY PASS
            </span>
          </div>
        </div>

        {/* WhatsApp Real-time Alert Notification Banner */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[var(--text-primary)] font-mono">
                WhatsApp Live Mesh Dispatch Confirmed
              </h4>
              <p className="text-xs text-[var(--text-secondary)]">
                Encrypted QR pass and proactive turnstile deconfliction alerts active for <strong>{user?.phone || '+91 98201 44821'}</strong>.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
            DELIVERED
          </span>
        </div>

        {/* ─── DIGITAL TICKET PASS CONTAINER ─── */}
        <div className="relative rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-soft overflow-hidden transition-colors">
          
          {/* Terracotta Top Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--terracotta-primary)] via-[#d97757] to-[var(--terracotta-hover)]" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Col: Fixture & Attendee Info */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[var(--terracotta-tint)] border border-[var(--terracotta-border)] px-2.5 py-0.5 text-[10px] font-mono font-bold text-[var(--terracotta-text)]">
                    MATCH {match?.id}
                  </span>
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    FIFA WOMEN’S WORLD CUP 2026
                  </span>
                </div>

                <div 
                  onClick={copyTicketId}
                  className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-1 text-[11px] font-mono text-[var(--text-secondary)] hover:border-[var(--terracotta-primary)] transition"
                  title="Click to copy Ticket ID"
                >
                  <span className="font-bold text-[var(--text-primary)]">{ticket?.unique_ticket_id}</span>
                  <span className="text-[9px] text-[var(--terracotta-text)] font-bold">{copied ? 'COPIED!' : 'COPY'}</span>
                </div>
              </div>

              {/* Match Headline */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-mono tracking-tight">
                  {match?.home_team} <span className="text-[var(--text-muted)] font-light">vs</span> {match?.away_team}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--text-secondary)] mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[var(--terracotta-primary)]" />
                    {formattedDate}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[var(--terracotta-primary)]" />
                    {formattedTime} KICKOFF
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--terracotta-primary)]" />
                    DY Patil Arena, Nerul
                  </span>
                </div>
              </div>

              {/* Ingress Specification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] block">SEAT BLOCK</span>
                  <span className="text-lg font-black text-[var(--text-primary)] font-mono">{block?.block_name || 'A1'}</span>
                </div>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] block">SEAT NUMBER</span>
                  <span className="text-lg font-black text-[var(--terracotta-text)] font-mono">{ticket?.seat_number || '12'}</span>
                </div>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] block">ENTRY GATE</span>
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {entryGate?.name?.split('·')[0] || 'Gate C'}
                  </span>
                </div>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] block">EXIT GATE</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                    {exitGate?.name?.split('·')[0] || 'Gate D'}
                  </span>
                </div>
              </div>

              {/* Logistics Specifics (Parking or Hotel/Shuttle) */}
              <div className="rounded-xl border border-[var(--terracotta-border)] bg-[var(--terracotta-tint)] p-3.5 flex items-center justify-between text-xs font-mono">
                {ticket?.visitor_type === 'local' ? (
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Car className="w-4 h-4 text-[var(--terracotta-primary)]" />
                    <span>
                      Reserved Parking: <strong>{parkingZone?.name || 'Zone P4 · South Lot'}</strong> (Entry via Palm Beach Road)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Hotel className="w-4 h-4 text-[var(--terracotta-primary)]" />
                    <span>
                      Hotel Partner: <strong>{hotel?.name || 'Savoy Seawoods'}</strong> · Shuttle: {shuttle?.zone || 'Zone 2 Express'}
                    </span>
                  </div>
                )}
                <span className="rounded bg-[var(--terracotta-primary)] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                  SMART ROUTED
                </span>
              </div>
            </div>

            {/* Right Col: QR Pass Shimmer Scanner */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 border-t lg:border-t-0 lg:border-l border-[var(--border-subtle)]">
              <div className="relative p-4 rounded-2xl bg-white shadow-soft overflow-hidden group border border-[var(--border-subtle)]">
                {/* Shimmer line pass across QR */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--terracotta-primary)]/15 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
                
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt="Digital Matchday Ingress Pass QR"
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-black font-mono text-xs">
                    GENERATING QR...
                  </div>
                )}
              </div>

              <div className="text-center mt-3 space-y-1">
                <span className="text-[11px] font-mono font-bold text-[var(--text-primary)] block tracking-wider">
                  SCAN AT CONCOURSE TURNSTILE
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)] block">
                  Encrypted biometric pass valid until final egress wave
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── CHRONOLOGICAL JOURNEY TIMELINE ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Timeline */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[var(--text-primary)] font-mono flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--terracotta-primary)]" />
                <span>Orchestrated Journey Timeline</span>
              </h3>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                ZERO DELAYS DETECTED
              </span>
            </div>

            <JourneyTimeline itinerary={{
              travel_mode: ticket?.travel_mode,
              assigned_parking: parkingZone?.name,
              assigned_gate: entryGate?.name,
              block,
              seat_number: ticket?.seat_number
            }} />
          </div>

          {/* Interactive Route Map */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[var(--text-primary)] font-mono flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[var(--terracotta-primary)]" />
                <span>Navigational Ingress Corridor</span>
              </h3>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1 text-[var(--terracotta-text)] font-semibold">
                  <span className="h-1.5 w-3 bg-[var(--terracotta-primary)]" /> Entry Line
                </span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                  <span className="h-1.5 w-3 bg-amber-500" /> Exit Egress
                </span>
              </div>
            </div>

            <TicketRouteMap route={route} height="360px" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
