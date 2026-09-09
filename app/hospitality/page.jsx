'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import KPICard from '../../components/KPICard';
import { 
  Hotel, 
  MapPin, 
  Bus, 
  Shield, 
  TrendingUp, 
  Calendar, 
  Users, 
  ArrowRight,
  Ticket,
  Filter
} from '../../components/Icons';

export default function HospitalityPage() {
  const [hotels, setHotels] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterZone, setFilterZone] = useState('all');

  useEffect(() => {
    async function loadHospitality() {
      try {
        const [hotelsRes, revRes] = await Promise.all([
          fetch('/api/hotels').catch(() => null),
          fetch('/api/dashboard/revenue').catch(() => null),
        ]);

        if (hotelsRes && hotelsRes.ok) {
          const hData = await hotelsRes.json();
          setHotels(hData);
        }

        if (revRes && revRes.ok) {
          const rData = await revRes.json();
          setRevenue(rData);
        }
      } catch (err) {
        console.error('Error loading hospitality data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHospitality();
  }, []);

  const filteredHotels = hotels.filter((h) => {
    if (filterZone === 'all') return true;
    return h.zone.toLowerCase() === filterZone.toLowerCase();
  });

  const hotelTotal = revenue?.hotel?.total || 6257250;
  const hotelBookings = revenue?.hotel?.count || 2743;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans transition-colors">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-10 space-y-10 pb-24">
        
        {/* Header Strip */}
        <div className="space-y-3 border-b border-[var(--border-subtle)] pb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--terracotta-border)] bg-[var(--terracotta-tint)] px-3 py-1 text-xs font-mono font-bold text-[var(--terracotta-text)]">
            <span className="h-2 w-2 rounded-full bg-[var(--terracotta-primary)] animate-pulse" />
            <span>PERIPHERAL LODGING ABSORPTION &amp; HOSPITALITY MESH</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-mono tracking-tight">
                Official FIFA Tournament Lodging
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
                12 integrated partner hotels across Navi Mumbai. Every booking includes guaranteed stadium shuttle convoy seats, eliminating event-day surge pricing.
              </p>
            </div>

            <Link
              href="/matches"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--terracotta-primary)] hover:bg-[var(--terracotta-hover)] px-5 py-2.5 text-xs font-mono font-bold text-white shadow-soft transition active:scale-95 whitespace-nowrap"
            >
              <Ticket className="w-4 h-4 text-white" />
              <span>Book Ticket + Hotel Bundle</span>
            </Link>
          </div>
        </div>

        {/* ─── HOSPITALITY METRICS STRIP ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="TOTAL ROOMS ABSORBED"
            value={hotelBookings}
            unit="stays"
            trend="+18.4%"
            trendDirection="up"
            status="terracotta"
            icon={Users}
          />
          <KPICard
            title="HOTEL REVENUE POOL"
            value={hotelTotal}
            format="currency"
            trend="100% Retained"
            trendDirection="up"
            status="green"
            icon={Hotel}
          />
          <KPICard
            title="DEDICATED SHUTTLES"
            value={108}
            unit="convoys"
            subtext="Zero waiting"
            status="cyan"
            icon={Bus}
          />
          <KPICard
            title="PARTNER PROPERTIES"
            value={12}
            unit="hotels"
            subtext="5 Strategic Zones"
            status="green"
            icon={Shield}
          />
        </div>

        {/* ─── PERIPHERAL ABSORPTION FEATURE EXPLAINER ─── */}
        <div className="rounded-2xl border border-[var(--terracotta-border)] bg-[var(--terracotta-tint)] p-6 sm:p-8 space-y-4 shadow-soft">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--terracotta-text)]">
            <Shield className="w-4 h-4 text-[var(--terracotta-primary)]" />
            <span>FEATURE: AUTOMATED PERIPHERAL ABSORPTION</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-mono">
            How Peripheral Lodging Saves ₹1.2 Cr in Spectator Hotel Gouging
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl">
            When core stadium radius hotels reach <strong>85% capacity</strong>, STADIA activates dynamic incentives for Tier-2 lodging in Vashi, Belapur, and Seawoods. Spectators get 40% lower room rates paired with free dedicated shuttle convoys, decentralizing traffic across the Sion-Panvel expressway.
          </p>
        </div>

        {/* ─── ZONE FILTER PILLS ─── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border-subtle)]">
          {[
            { id: 'all', label: 'All 12 Hotels' },
            { id: 'vashi', label: 'Vashi Hub (2.2 km)' },
            { id: 'belapur', label: 'CBD Belapur (4.2 km)' },
            { id: 'seawoods', label: 'Seawoods Grand (1.8 km)' },
            { id: 'nerul', label: 'Nerul Core (1.7 km)' },
            { id: 'airport-belt', label: 'Airport Belt (14 km)' },
          ].map((z) => (
            <button
              key={z.id}
              onClick={() => setFilterZone(z.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition whitespace-nowrap ${
                filterZone === z.id
                  ? 'bg-[var(--terracotta-primary)] text-white shadow-soft'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>

        {/* ─── HOTEL INVENTORY GRID ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => (
            <div
              key={hotel.id}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-soft flex flex-col justify-between space-y-4 hover:border-[var(--terracotta-border)] transition group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-[var(--terracotta-tint)] border border-[var(--terracotta-border)] px-2 py-0.5 text-[10px] font-mono font-bold text-[var(--terracotta-text)]">
                    {hotel.zone}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] font-bold uppercase">
                    {hotel.tier} Tier
                  </span>
                </div>

                <h3 className="text-base font-bold text-[var(--text-primary)] font-mono group-hover:text-[var(--terracotta-primary)] transition-colors">
                  {hotel.name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-mono">
                  <MapPin className="w-3.5 h-3.5 text-[var(--terracotta-primary)]" />
                  <span>{hotel.distance_from_stadium_km} km to DY Patil Arena</span>
                </div>
              </div>

              {/* Shuttle info */}
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-xs font-mono space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Bus className="w-3.5 h-3.5" />
                  <span>Dedicated Event Shuttle Linked</span>
                </div>
                <div className="text-[11px] text-[var(--text-muted)]">
                  Scheduled departure: T-3h &amp; T-2h before kickoff
                </div>
              </div>

              {/* Price & Booking Footer */}
              <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                <div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] block uppercase">Nightly Rate</span>
                  <span className="text-base font-black text-[var(--text-primary)] font-mono">
                    ₹{hotel.nightly_rate?.toLocaleString()}
                  </span>
                </div>

                <Link
                  href="/matches"
                  className="flex items-center gap-1 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--terracotta-primary)] hover:text-white text-[var(--terracotta-text)] px-3 py-1.5 text-xs font-mono font-bold transition shadow-xs"
                >
                  <span>Select With Match</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
