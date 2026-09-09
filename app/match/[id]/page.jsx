'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import SeatMap from '../../../components/SeatMap';
import { Calendar, Clock, MapPin, Ticket, Shield, ArrowRight, ArrowLeft } from '../../../components/Icons';

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id;

  const [matchData, setMatchData] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState('C1');
  const [selectedSeat, setSelectedSeat] = useState('C12');

  useEffect(() => {
    async function loadSeatData() {
      try {
        const res = await fetch(`/api/matches/${matchId}/seats`);
        if (res.ok) {
          const data = await res.json();
          setMatchData(data.match);
          setBlocks(data.blocks || []);
          if (data.blocks?.length > 0) {
            setSelectedBlock(data.blocks[0].block_name);
            setSelectedSeat('B04');
          }
        }
      } catch (err) {
        console.error('Error fetching seat layout:', err);
      } finally {
        setLoading(false);
      }
    }
    if (matchId) {
      loadSeatData();
    }
  }, [matchId]);

  const activeBlock = blocks.find((b) => b.block_name === selectedBlock);
  const price = activeBlock?.price || 2500;

  const dateObj = matchData ? new Date(matchData.kickoff_time) : new Date();
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans transition-colors">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-8 pb-32">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/matches"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] hover:text-[var(--terracotta-primary)] transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Matches</span>
          </Link>
        </div>

        {/* Match Header Hero Card */}
        {matchData && (
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 mb-8 shadow-soft">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[var(--terracotta-tint)] px-2.5 py-0.5 text-xs font-mono font-bold text-[var(--terracotta-text)] border border-[var(--terracotta-border)]">
                    MATCH {matchData.id} · GROUP STAGE
                  </span>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    SEATS OPEN FOR ALLOCATION
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-primary)] font-mono tracking-tight">
                  {matchData.home_team} <span className="text-[var(--text-muted)] font-light">vs</span> {matchData.away_team}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--text-secondary)] pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>{formattedTime} IST</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[var(--terracotta-primary)]" />
                    <span>{matchData.venue}</span>
                  </div>
                </div>
              </div>

              {/* Ingress status badge */}
              <div className="rounded-xl border border-[var(--terracotta-border)] bg-[var(--terracotta-tint)] p-4 max-w-xs space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--terracotta-text)]">
                  <Shield className="w-3.5 h-3.5" />
                  <span>SMART INGRESS ACTIVE</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Your seat automatically reserves optimal gate turnstile and synchronized parking/shuttle slots.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stadium Seat Map Visual */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[var(--text-primary)] font-mono flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[var(--terracotta-primary)]" />
              <span>Interactive Stadium Seat Selection</span>
            </h2>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              Pick Block → Select Specific Seat
            </span>
          </div>

          <SeatMap
            blocks={blocks}
            selectedBlock={selectedBlock}
            onSelectBlock={(blockName) => setSelectedBlock(blockName)}
            selectedSeat={selectedSeat}
            onSelectSeat={(seatCode) => setSelectedSeat(seatCode)}
          />
        </div>
      </main>

      {/* Sticky Bottom Booking Confirmation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-3.5 shadow-soft">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--terracotta-tint)] border border-[var(--terracotta-border)] text-[var(--terracotta-text)] font-mono font-bold text-sm">
              {selectedBlock || 'A1'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-[var(--text-primary)] font-mono">
                  Block {selectedBlock} · Seat {selectedSeat || 'Unpicked'}
                </span>
                <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                  RESERVED
                </span>
              </div>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                Includes Smart Gate Sync &amp; Deconfliction Router
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
            <div className="text-right">
              <span className="text-xs text-[var(--text-muted)] font-mono block">Total (1 Fan)</span>
              <span className="text-xl font-black text-[var(--text-primary)] font-mono">
                ₹{price.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => {
                if (selectedBlock && selectedSeat) {
                  router.push(`/checkout/${matchId}/${selectedBlock}/${selectedSeat}`);
                }
              }}
              className="flex items-center gap-2 rounded-xl bg-[var(--terracotta-primary)] hover:bg-[var(--terracotta-hover)] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-soft transition active:scale-95 whitespace-nowrap"
            >
              <span>Continue to Travel &amp; Ingress Setup</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
