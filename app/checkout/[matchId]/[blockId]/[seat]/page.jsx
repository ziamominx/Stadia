'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../../../components/Navbar';
import Footer from '../../../../../components/Footer';
import { 
  Ticket, 
  Shield, 
  Car, 
  Bus, 
  Hotel, 
  Users, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  ArrowLeft,
  Calendar,
  AlertCircle
} from '../../../../../components/Icons';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { matchId, blockId, seat } = params;

  const [step, setStep] = useState(2);
  const [matchData, setMatchData] = useState(null);
  const [blockData, setBlockData] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [calculationLog, setCalculationLog] = useState([]);

  // Form State
  const [name, setName] = useState('Rahul Deshmukh');
  const [phone, setPhone] = useState('+91 98201 44821');
  const [email, setEmail] = useState('rahul.deshmukh@gmail.com');
  const [homeLocation, setHomeLocation] = useState('Vashi, Navi Mumbai');
  const [visitorType, setVisitorType] = useState('local');
  const [travelMode, setTravelMode] = useState('vehicle');
  const [selectedHotelId, setSelectedHotelId] = useState(1);

  useEffect(() => {
    async function initData() {
      try {
        const [seatsRes, hotelsRes] = await Promise.all([
          fetch(`/api/matches/${matchId}/seats`).catch(() => null),
          fetch('/api/hotels').catch(() => null)
        ]);

        if (seatsRes && seatsRes.ok) {
          const sData = await seatsRes.json();
          setMatchData(sData.match);
          const foundBlock = sData.blocks?.find(
            b => b.block_name === blockId || b.id.toString() === blockId
          );
          setBlockData(foundBlock || sData.blocks?.[0]);
        }

        if (hotelsRes && hotelsRes.ok) {
          const hData = await hotelsRes.json();
          setHotels(hData);
          if (hData.length > 0) setSelectedHotelId(hData[0].id);
        }
      } catch (err) {
        console.error('Checkout load error:', err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, [matchId, blockId]);

  const handleStartSmartRouting = async (e) => {
    e.preventDefault();
    if (!name || !phone) return;

    setStep(3);
    setSubmitting(true);
    setCalculationLog([]);

    const logMessages = [
      'Authenticating match reservation on DY Patil central node...',
      'Evaluating real-time gate loads across Sectors A through H...',
      visitorType === 'local' && travelMode === 'vehicle' 
        ? 'Zone P3 nearing 88% capacity limit · Executing dynamic diversion algorithm...'
        : 'Synchronizing MMRDA suburban rail & feeder bus express time slots...',
      visitorType === 'outstation'
        ? `Matching with Hotel Partner #${selectedHotelId} and reserving dedicated shuttle slot...`
        : 'Auto-allocating uncongested turnstiles at closest concourse gate...',
      'Generating cryptographically signed FIFA mobile digital ticket pass...'
    ];

    for (let i = 0; i < logMessages.length; i++) {
      await new Promise(r => setTimeout(r, 650));
      setCalculationLog(prev => [...prev, logMessages[i]]);
    }

    try {
      const bookRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: parseInt(matchId),
          seatBlockId: blockData?.id || 1,
          seatNumber: seat || 'C12',
          user: { name, phone, email, homeLocation }
        })
      });

      const bookData = await bookRes.json();
      const ticketId = bookData.ticketId;

      if (!ticketId) {
        throw new Error(bookData.error || 'Failed to create ticket');
      }

      if (visitorType === 'local') {
        await fetch(`/api/bookings/${ticketId}/travel-info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorType: 'local', travelMode })
        });
      } else {
        await fetch(`/api/bookings/${ticketId}/travel-info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorType: 'outstation' })
        });

        await fetch(`/api/bookings/${ticketId}/hotel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hotelId: selectedHotelId })
        });
      }

      await new Promise(r => setTimeout(r, 800));
      router.push(`/ticket/${ticketId}`);
    } catch (err) {
      console.error('Booking submission failed:', err);
      alert('Booking note: ' + err.message);
      setSubmitting(false);
      setStep(2);
    }
  };

  const price = blockData?.price || 2500;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans transition-colors">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full py-10 pb-28">
        
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[var(--text-muted)] font-bold">STEP 01: SEAT PICKED</span>
            <span className={step >= 2 ? 'text-[var(--terracotta-text)] font-bold' : 'text-[var(--text-muted)]'}>
              STEP 02: VISITOR COHORT &amp; LOGISTICS
            </span>
            <span className={step === 3 ? 'text-[var(--terracotta-text)] font-bold' : 'text-[var(--text-muted)]'}>
              STEP 03: AUTONOMOUS ROUTING
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--border-subtle)] overflow-hidden flex">
            <div className="h-full bg-emerald-500 w-1/3" />
            <div className={`h-full transition-all duration-500 ${step >= 2 ? 'bg-[var(--terracotta-primary)] w-1/3' : 'w-0'}`} />
            <div className={`h-full transition-all duration-500 ${step === 3 ? 'bg-[var(--terracotta-hover)] w-1/3 animate-pulse' : 'w-0'}`} />
          </div>
        </div>

        {step === 2 && (
          <form onSubmit={handleStartSmartRouting} className="space-y-8 animate-fadeIn">
            
            {/* Match & Seat Summary Banner */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--terracotta-tint)] border border-[var(--terracotta-border)] text-[var(--terracotta-text)] font-mono font-black text-base">
                  {blockData?.block_name || blockId}
                </div>
                <div>
                  <h3 className="text-base font-black text-[var(--text-primary)] font-mono">
                    {matchData?.home_team} vs {matchData?.away_team}
                  </h3>
                  <div className="text-xs text-[var(--text-secondary)] font-mono">
                    Block {blockData?.block_name || blockId} · Seat {seat} · DY Patil Stadium
                  </div>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-xs font-mono text-[var(--text-muted)] block">Total Due</span>
                <span className="text-xl font-black text-[var(--terracotta-text)] font-mono">
                  ₹{price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Fan Information */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4 shadow-soft">
              <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
                <Users className="w-4 h-4 text-[var(--terracotta-primary)]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono">
                  01 · Fan Identification
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-[var(--text-secondary)] block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--terracotta-primary)] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[var(--text-secondary)] block mb-1">Mobile (WhatsApp for Ingress Pass)</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--terracotta-primary)] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[var(--text-secondary)] block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--terracotta-primary)] focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-[var(--text-secondary)] block mb-1">Origin City / Area</label>
                  <input
                    type="text"
                    value={homeLocation}
                    onChange={(e) => setHomeLocation(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--terracotta-primary)] focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Visitor Classification Selection */}
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4 shadow-soft">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[var(--terracotta-primary)]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono">
                    02 · Visitor Cohort Classification
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[var(--terracotta-text)] font-semibold">
                  Key to Deconfliction Mesh
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Local Cohort */}
                <div
                  onClick={() => setVisitorType('local')}
                  className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                    visitorType === 'local'
                      ? 'border-[var(--terracotta-primary)] bg-[var(--terracotta-tint)] shadow-soft'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold uppercase text-[var(--text-primary)]">
                      Local Resident (MMR / Pune)
                    </span>
                    <Car className={`w-4 h-4 ${visitorType === 'local' ? 'text-[var(--terracotta-primary)]' : 'text-[var(--text-muted)]'}`} />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Same-day commuter arriving via personal car, two-wheeler, or suburban transit line.
                  </p>
                </div>

                {/* Outstation Cohort */}
                <div
                  onClick={() => setVisitorType('outstation')}
                  className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                    visitorType === 'outstation'
                      ? 'border-[var(--terracotta-primary)] bg-[var(--terracotta-tint)] shadow-soft'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold uppercase text-[var(--text-primary)]">
                      Outstation / International Fan
                    </span>
                    <Hotel className={`w-4 h-4 ${visitorType === 'outstation' ? 'text-[var(--terracotta-primary)]' : 'text-[var(--text-muted)]'}`} />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Traveling from outside MMR. Requires hotel reservation and synchronized tournament shuttle.
                  </p>
                </div>
              </div>

              {/* Sub-options for Local */}
              {visitorType === 'local' && (
                <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
                  <span className="text-xs font-mono text-[var(--text-secondary)] block font-semibold">
                    Select Your Travel Mode to Stadium:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTravelMode('vehicle')}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-mono transition ${
                        travelMode === 'vehicle'
                          ? 'border-[var(--terracotta-primary)] bg-[var(--terracotta-tint)] text-[var(--text-primary)] font-bold'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <Car className="w-4 h-4 text-[var(--terracotta-primary)]" />
                      <span>Personal Vehicle (Parking Zone)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTravelMode('transit')}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-mono transition ${
                        travelMode === 'transit'
                          ? 'border-[var(--terracotta-primary)] bg-[var(--terracotta-tint)] text-[var(--text-primary)] font-bold'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <Bus className="w-4 h-4 text-[var(--terracotta-primary)]" />
                      <span>Metro / Commuter Train</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-options for Outstation */}
              {visitorType === 'outstation' && (
                <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[var(--text-secondary)] block font-semibold">
                      Select Integrated Partner Hotel:
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      100% Shuttle Guaranteed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                    {hotels.map((h) => (
                      <div
                        key={h.id}
                        onClick={() => setSelectedHotelId(h.id)}
                        className={`cursor-pointer rounded-xl border p-3 transition ${
                          selectedHotelId === h.id
                            ? 'border-[var(--terracotta-primary)] bg-[var(--terracotta-tint)]'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--border-hover)]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono font-bold text-[var(--text-primary)] mb-0.5">
                          <span>{h.name}</span>
                          <span className="text-[var(--terracotta-text)]">₹{h.nightly_rate?.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)]">
                          <span>{h.zone} · {h.tier}</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{h.distance_from_stadium_km} km to Arena</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit CTA */}
            <div className="flex items-center justify-between pt-4">
              <Link
                href={`/match/${matchId}`}
                className="text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Modify Seat Choice</span>
              </Link>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-[var(--terracotta-primary)] hover:bg-[var(--terracotta-hover)] px-8 py-3.5 text-sm font-bold text-white shadow-soft transition active:scale-95"
              >
                <Zap className="w-4 h-4 text-white" />
                <span>Execute Autonomous Ingress Routing</span>
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Smart Assignment Simulation Screen */}
        {step === 3 && (
          <div className="rounded-2xl border border-[var(--terracotta-border)] bg-[var(--bg-surface)] p-8 shadow-soft space-y-6 text-center animate-fadeIn">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--terracotta-tint)] border border-[var(--terracotta-border)] mx-auto text-[var(--terracotta-primary)]">
              <Zap className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-[var(--text-primary)] font-mono">
                STADIA Autonomous Routing in Progress
              </h2>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto font-mono">
                Calculating least-resistance pedestrian corridors and reserving live gate turnstiles for {name}...
              </p>
            </div>

            {/* Live Terminal Log Stream */}
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 text-left font-mono text-xs space-y-2 max-w-xl mx-auto shadow-inner">
              <div className="text-[10px] text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-1 font-bold">
                NODE_ROUTING_STREAM · DY_PATIL_INGRESS_ENGINE
              </div>
              {calculationLog.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[var(--terracotta-text)] animate-fadeIn">
                  <span className="text-[var(--text-muted)]">[{idx + 1}]</span>
                  <span>{log}</span>
                </div>
              ))}
              {submitting && (
                <div className="flex items-center gap-2 text-[var(--text-muted)] animate-pulse">
                  <span>▶</span>
                  <span>Allocating cryptographic QR token...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
