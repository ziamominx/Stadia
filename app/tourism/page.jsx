'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Compass, MapPin, Calendar, Clock, ArrowRight, Ticket } from '../../components/Icons';

export default function TourismPage() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTourism() {
      try {
        const res = await fetch('/api/tourism');
        if (res.ok) {
          const data = await res.json();
          setDestinations(data);
        }
      } catch (err) {
        console.error('Error loading tourism destinations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTourism();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans transition-colors">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-10 space-y-10 pb-24">
        
        {/* Header Strip */}
        <div className="space-y-3 border-b border-[var(--border-subtle)] pb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--terracotta-border)] bg-[var(--terracotta-tint)] px-3 py-1 text-xs font-mono font-bold text-[var(--terracotta-text)]">
            <Compass className="w-3.5 h-3.5 text-[var(--terracotta-primary)]" />
            <span>FAN TRAVEL GUIDE · NAVI MUMBAI &amp; MAHARASHTRA</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] font-mono tracking-tight">
                Explore The Host Region
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
                Make the most of your tournament trip. Discover scenic hill stations, coastal forts, and iconic Mumbai heritage sites within easy reach of DY Patil Stadium.
              </p>
            </div>

            <Link
              href="/matches"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--terracotta-primary)] hover:bg-[var(--terracotta-hover)] px-5 py-2.5 text-xs font-mono font-bold text-white shadow-soft transition active:scale-95"
            >
              <Ticket className="w-4 h-4 text-white" />
              <span>Match Fixtures</span>
            </Link>
          </div>
        </div>

        {/* ─── DESTINATIONS GRID ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-soft flex flex-col justify-between space-y-4 hover:border-[var(--terracotta-border)] transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-4xl filter drop-shadow-sm">{dest.image_emoji || '📍'}</span>
                  <span className="rounded bg-[var(--terracotta-tint)] border border-[var(--terracotta-border)] px-2 py-0.5 text-[10px] font-mono font-bold text-[var(--terracotta-text)]">
                    {dest.distance_from_mumbai_km} km from Stadium
                  </span>
                </div>

                <h3 className="text-xl font-black text-[var(--text-primary)] font-mono group-hover:text-[var(--terracotta-primary)] transition-colors">
                  {dest.name}
                </h3>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                  {dest.description}
                </p>
              </div>

              {/* Best Season info */}
              <div className="border-t border-[var(--border-subtle)] pt-3 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span className="text-[var(--text-muted)]">Best Visiting Window:</span>
                  <span className="text-[var(--text-primary)] font-bold">{dest.best_time}</span>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] text-[var(--terracotta-text)] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Explore travel routes</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
