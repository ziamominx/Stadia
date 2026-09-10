'use client';

import React from 'react';
import { 
  Car, 
  Bus, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Shield, 
  Ticket, 
  Navigation,
  AlertCircle
} from './Icons';

export default function JourneyTimeline({ itinerary, steps }) {
  const defaultSteps = [
    {
      time: '16:15',
      title: 'Departure & Route Navigation',
      desc: itinerary?.travel_mode === 'metro' 
        ? 'Board Nerul Line from origin station. Dedicated event express in service.'
        : 'Depart origin. Route directed via Uran Phata expressway to avoid Palm Beach bottleneck.',
      icon: itinerary?.travel_mode === 'metro' ? Bus : Car,
      status: 'completed',
      badge: 'TRAFFIC CLEARED'
    },
    {
      time: '17:00',
      title: `Arrival at ${itinerary?.assigned_parking || 'Parking P4 / Transit Hub'}`,
      desc: itinerary?.assigned_parking 
        ? `${itinerary.assigned_parking} reserved. QR scan active at entry barrier.`
        : 'Arrive at DY Patil Metro Station. Follow South Concourse illuminated signage.',
      icon: MapPin,
      status: 'active',
      badge: 'RESERVED SPOT'
    },
    {
      time: '17:25',
      title: `Security Screening · ${itinerary?.assigned_gate || 'Gate C'}`,
      desc: `Proceed to ${itinerary?.assigned_gate || 'Gate C'}. Express fast-track biometric turnstiles active. Average wait 3 mins.`,
      icon: Shield,
      status: 'upcoming',
      badge: 'MINIMUM QUEUE'
    },
    {
      time: '17:45',
      title: `Concourse & Seat Block ${itinerary?.block?.block_name || 'C1'}`,
      desc: `Enter Concourse Level 2. Seat ${itinerary?.seat_number || '14'} in Block ${itinerary?.block?.block_name || 'C1'}. F&B kiosk 4B adjacent.`,
      icon: Ticket,
      status: 'upcoming',
      badge: 'PITCH VIEW'
    },
    {
      time: '18:00',
      title: 'Match Kickoff · FIFA Women’s World Cup',
      desc: 'National anthems & team walkout. Emergency exits and egress waves pre-programmed.',
      icon: Navigation,
      status: 'upcoming',
      badge: 'KICKOFF'
    }
  ];

  const timelineSteps = steps || defaultSteps;

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-subtle)]">
      {timelineSteps.map((step, idx) => {
        const Icon = step.icon || Clock;
        const isCompleted = step.status === 'completed';
        const isActive = step.status === 'active';

        return (
          <div key={idx} className="relative group">
            {/* Timeline indicator node */}
            <div className={`absolute -left-6 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200 ${
              isCompleted 
                ? 'border-emerald-600 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                : isActive 
                ? 'border-[var(--terracotta-primary)] bg-[var(--terracotta-tint)] text-[var(--terracotta-text)] shadow-soft ring-4 ring-[var(--terracotta-primary)]/10 animate-pulse'
                : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-muted)]'
            }`}>
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Icon className="w-3 h-3" />
              )}
            </div>

            {/* Step card */}
            <div className={`rounded-xl border p-4 transition-all duration-200 ${
              isActive 
                ? 'border-[var(--terracotta-border)] bg-[var(--bg-surface)] shadow-soft ring-1 ring-[var(--terracotta-border)]' 
                : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-hover)]'
            }`}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black font-mono text-[var(--terracotta-text)] bg-[var(--terracotta-tint)] px-2 py-0.5 rounded border border-[var(--terracotta-border)]">
                    {step.time}
                  </span>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] font-mono">
                    {step.title}
                  </h4>
                </div>

                {step.badge && (
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                    isActive 
                      ? 'bg-[var(--terracotta-tint)] text-[var(--terracotta-text)] border-[var(--terracotta-border)]' 
                      : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                  }`}>
                    {step.badge}
                  </span>
                )}
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
                {step.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
