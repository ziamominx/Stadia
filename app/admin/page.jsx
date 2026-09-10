'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { 
  Shield, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Lock, 
  Unlock, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  Hotel, 
  Train, 
  Bus, 
  Car, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  Filter,
  Check,
  X,
  Zap,
  Sliders
} from '../../components/Icons';
import { INITIAL_EVENTS, getStoredEvents, saveStoredEvents, createNewEvent, deleteStoredEvent } from '../../lib/eventsData';

export default function AdminPage() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState(INITIAL_EVENTS[0].id);
  const [filterCategory, setFilterCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminAuthenticated, setAdminAuthenticated] = useState(true);
  const [accessPasscode, setAccessPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'gates' | 'transit' | 'logs'
  const [notification, setNotification] = useState(null);

  // Form state for creating a new event
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    subtitle: '',
    category: 'fifa',
    categoryLabel: 'FIFA Football',
    sport: 'Football',
    venue: 'DY Patil Stadium',
    city: 'Navi Mumbai',
    area: 'Nerul, Sector 7',
    date: '2026-07-15',
    time: '19:00 IST',
    capacity: 55000,
    basePrice: 1500,
    organizer: 'FIFA TMS & Event Ops',
    badge: 'VERIFIED CHAMPIONSHIP',
    description: '',
  });

  // Load stored events from localStorage on mount
  useEffect(() => {
    const loaded = getStoredEvents();
    setEvents(loaded);
    if (loaded.length > 0 && !selectedEventId) {
      setSelectedEventId(loaded[0].id);
    }

    const handleUpdate = (e) => {
      if (e.detail) {
        setEvents(e.detail);
      }
    };
    window.addEventListener('stadia_events_updated', handleUpdate);
    return () => window.removeEventListener('stadia_events_updated', handleUpdate);
  }, [selectedEventId]);

  const selectedEvent = events.find(e => e.id === selectedEventId) || events[0] || INITIAL_EVENTS[0];

  const filteredEvents = events.filter(e => {
    if (filterCategory === 'all') return true;
    return e.category === filterCategory;
  });

  // Handle Create Event submission
  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!newEventForm.title.trim()) {
      alert('Please enter an event title');
      return;
    }

    // Assign appropriate label based on category
    let label = 'Sports';
    if (newEventForm.category === 'fifa') label = 'FIFA Football';
    if (newEventForm.category === 'f1') label = 'Formula 1';
    if (newEventForm.category === 'concert') label = 'Concerts & Festivals';
    if (newEventForm.category === 'cricket') label = 'Cricket Derby';

    const created = createNewEvent({
      ...newEventForm,
      categoryLabel: label,
    });

    setEvents(getStoredEvents());
    setSelectedEventId(created.id);
    setIsModalOpen(false);
    showNotice(`Event "${created.title}" successfully added to Stadia Mesh!`);

    // Reset form
    setNewEventForm({
      title: '',
      subtitle: '',
      category: 'fifa',
      categoryLabel: 'FIFA Football',
      sport: 'Football',
      venue: 'DY Patil Stadium',
      city: 'Navi Mumbai',
      area: 'Nerul, Sector 7',
      date: '2026-07-15',
      time: '19:00 IST',
      capacity: 55000,
      basePrice: 1500,
      organizer: 'Stadia Operations Mesh',
      badge: 'VERIFIED CHAMPIONSHIP',
      description: '',
    });
  };

  // Handle Event Deletion
  const handleDeleteEvent = (id, title) => {
    if (confirm(`Are you sure you want to delete event "${title}" from the operations mesh?`)) {
      const remaining = deleteStoredEvent(id);
      setEvents(remaining);
      if (selectedEventId === id && remaining.length > 0) {
        setSelectedEventId(remaining[0].id);
      }
      showNotice(`Event "${title}" has been removed.`);
    }
  };

  const showNotice = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Quick stats across all events
  const totalCapacityManaged = events.reduce((acc, e) => acc + (Number(e.capacity) || 0), 0);
  const totalTicketsSold = events.reduce((acc, e) => acc + (Number(e.sold) || 0), 0);
  const totalRevenue = events.reduce((acc, e) => acc + (Number(e.grossRevenue) || 0), 0);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans transition-colors">
      <Navbar />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-[var(--status-green-border)] bg-[var(--bg-surface)] px-4 py-3 text-xs font-mono font-bold text-[var(--status-green)] shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[var(--status-green)]" />
          <span>{notification}</span>
        </div>
      )}

      <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full py-8 space-y-8">

        {/* Top Operational Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--terracotta-border)] bg-[var(--terracotta-tint)] px-3 py-0.5 text-xs font-mono font-bold text-[var(--terracotta-text)]">
                <Shield className="w-3.5 h-3.5 text-[var(--terracotta-primary)]" />
                <span>ADMIN CONSOLE</span>
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">·</span>
              <span className="text-xs font-mono font-semibold text-[var(--status-green)] flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[var(--status-green)] animate-pulse" />
                SYSTEM LIVE · TELEMETRY SYNCED
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--text-primary)] uppercase font-mono">
              Event Management &amp; Analytics Hub
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Full administrative authority to provision mega-events (FIFA, F1, Concerts) and monitor real-time crowd dynamics, concourse strain, and transit splits.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[var(--terracotta-primary)] hover:bg-[var(--terracotta-hover)] px-4 py-2 text-xs font-bold text-white shadow-soft transition-all duration-150 active:scale-95"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Create / Add Event</span>
            </button>

            <Link
              href="/command-center"
              className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] px-3.5 py-2 text-xs font-mono font-semibold text-[var(--text-primary)] shadow-xs transition"
            >
              <Activity className="w-3.5 h-3.5 text-[var(--terracotta-primary)]" />
              <span>Live Command</span>
            </Link>

            <button
              onClick={() => {
                setAdminAuthenticated(!adminAuthenticated);
                showNotice(adminAuthenticated ? 'Admin session locked.' : 'Superadmin access verified.');
              }}
              title={adminAuthenticated ? 'Lock Console' : 'Unlock Console'}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] px-3 py-2 text-xs font-mono font-semibold text-[var(--text-secondary)] transition"
            >
              {adminAuthenticated ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-[var(--status-green)]" />
                  <span className="text-[var(--status-green)] font-bold">OPS AUTH</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-[var(--status-amber)]" />
                  <span>READ ONLY</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Operational Metrics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--text-muted)] uppercase">Active Events</span>
              <span className="rounded-full bg-[var(--terracotta-tint)] text-[var(--terracotta-text)] border border-[var(--terracotta-border)] px-2 py-0.5 text-[10px] font-mono font-bold">
                {events.length} ACTIVE
              </span>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-[var(--text-primary)]">
              {events.length}
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
              FIFA, F1 &amp; Stadium Tours
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--text-muted)] uppercase">Total Seats Managed</span>
              <Users className="w-4 h-4 text-[var(--terracotta-primary)]" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-[var(--text-primary)]">
              {totalCapacityManaged.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
              {totalTicketsSold.toLocaleString()} tickets allocated ({Math.round((totalTicketsSold / (totalCapacityManaged || 1)) * 100)}%)
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--text-muted)] uppercase">Gross Revenue</span>
              <DollarSign className="w-4 h-4 text-[var(--status-green)]" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-[var(--text-primary)]">
              ₹{(totalRevenue / 10000000).toFixed(1)} Cr
            </div>
            <div className="mt-1 text-[11px] text-[var(--status-green)] font-semibold">
              +14.8% vs non-orchestrated baseline
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--text-muted)] uppercase">Mesh Safety Index</span>
              <span className="h-2 w-2 rounded-full bg-[var(--status-green)]" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-[var(--status-green)]">
              98.4%
            </div>
            <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
              Zero severe concourse pinch points
            </div>
          </div>
        </div>

        {/* SECTION 1: EVENT REGISTRY & SELECTION */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] font-mono flex items-center gap-2">
                <span>1. Event Registry</span>
                <span className="text-xs text-[var(--text-muted)] font-normal">({events.length} configured)</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Select an event to inspect its full operational analytics or click &quot;Create / Add Event&quot; to register a new one.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Events' },
                { id: 'fifa', label: 'FIFA Football' },
                { id: 'f1', label: 'Formula 1' },
                { id: 'concert', label: 'Concerts' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterCategory(tab.id)}
                  className={`rounded-full px-3 py-1 text-xs font-mono transition-all whitespace-nowrap ${
                    filterCategory === tab.id
                      ? 'bg-[var(--terracotta-tint)] text-[var(--terracotta-text)] border border-[var(--terracotta-border)] font-bold'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Events Horizontal/Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((evt) => {
              const isSelected = evt.id === selectedEvent?.id;
              const soldPct = Math.round(((evt.sold || 0) / (evt.capacity || 1)) * 100);

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${
                    isSelected
                      ? 'border-[var(--terracotta-primary)] bg-[var(--bg-surface)] shadow-md ring-2 ring-[var(--terracotta-primary)]/20'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-hover)] hover:shadow-sm'
                  }`}
                >
                  {/* Category Chip & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                      evt.category === 'f1' 
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                        : evt.category === 'concert'
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                        : 'bg-[var(--terracotta-tint)] text-[var(--terracotta-text)] border border-[var(--terracotta-border)]'
                    }`}>
                      {evt.categoryLabel || evt.category?.toUpperCase()}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${
                        evt.status === 'Live' ? 'bg-[var(--status-green)] animate-pulse' : 'bg-[var(--terracotta-primary)]'
                      }`} />
                      <span className="text-[11px] font-mono font-bold text-[var(--text-secondary)]">
                        {evt.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-base font-black text-[var(--text-primary)] font-mono leading-snug">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-1">
                    {evt.subtitle || evt.description}
                  </p>

                  {/* Metadata pills */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[var(--terracotta-primary)] shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                      <span>{evt.date}</span>
                    </div>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-[var(--text-secondary)]">Capacity Filled</span>
                      <span className="font-bold text-[var(--text-primary)]">{soldPct}% ({evt.sold?.toLocaleString()} / {evt.capacity?.toLocaleString()})</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[var(--terracotta-primary)] to-[#d97757] transition-all duration-500"
                        style={{ width: `${Math.min(100, soldPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Card Bottom CTA & Delete */}
                  <div className="mt-4 flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs font-mono">
                    <span className={`font-bold flex items-center gap-1 ${
                      isSelected ? 'text-[var(--terracotta-text)]' : 'text-[var(--text-secondary)]'
                    }`}>
                      {isSelected ? 'ACTIVE VIEWING' : 'CLICK TO VIEW ANALYTICS'}
                      <ChevronRight className="w-3 h-3" />
                    </span>

                    {adminAuthenticated && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(evt.id, evt.title);
                        }}
                        title="Delete Event"
                        className="p-1 text-[var(--text-muted)] hover:text-red-500 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: COMPLETE PER-EVENT ANALYTICS FOR SELECTED EVENT */}
        {selectedEvent && (
          <div className="space-y-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-soft">
            
            {/* Selected Event Focus Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[var(--terracotta-tint)] text-[var(--terracotta-text)] border border-[var(--terracotta-border)] px-3 py-0.5 text-[11px] font-mono font-bold">
                    EVENT TELEMETRY: {selectedEvent.categoryLabel || selectedEvent.category?.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-[var(--text-muted)]">ID: {selectedEvent.id}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] font-mono">
                  {selectedEvent.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--text-secondary)]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--terracotta-primary)]" />
                    {selectedEvent.venue} ({selectedEvent.city})
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    {selectedEvent.date} @ {selectedEvent.time}
                  </span>
                  <span>·</span>
                  <span className="text-[var(--terracotta-text)] font-bold">
                    Organizer: {selectedEvent.organizer || 'Stadia Mesh'}
                  </span>
                </div>
              </div>

              {/* Sub-tabs for detailed drilldown */}
              <div className="flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1">
                {[
                  { id: 'analytics', label: 'Concourse & Revenue' },
                  { id: 'gates', label: 'Gate Balancer' },
                  { id: 'transit', label: 'Transit & Hotels' },
                  { id: 'logs', label: 'Incident Dispatch' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-mono transition ${
                      activeTab === t.id
                        ? 'bg-[var(--bg-surface)] text-[var(--terracotta-text)] font-bold shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT: ANALYTICS & CONCOURSE REVENUE */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* 4 Core KPIs for this event */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
                    <div className="text-[11px] font-mono text-[var(--text-muted)] uppercase">Attendance Velocity</div>
                    <div className="mt-1 text-2xl font-black font-mono text-[var(--terracotta-text)]">
                      {selectedEvent.ingressRate || 142} <span className="text-xs font-normal">pax/min</span>
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
                      Active turnstile intake pace
                    </div>
                  </div>

                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
                    <div className="text-[11px] font-mono text-[var(--text-muted)] uppercase">Tickets Sold / Capacity</div>
                    <div className="mt-1 text-2xl font-black font-mono text-[var(--text-primary)]">
                      {Math.round(((selectedEvent.sold || 0) / (selectedEvent.capacity || 1)) * 100)}%
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
                      {selectedEvent.sold?.toLocaleString()} of {selectedEvent.capacity?.toLocaleString()} seats
                    </div>
                  </div>

                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
                    <div className="text-[11px] font-mono text-[var(--text-muted)] uppercase">Gross Event Revenue</div>
                    <div className="mt-1 text-2xl font-black font-mono text-[var(--status-green)]">
                      ₹{((selectedEvent.grossRevenue || 12000000) / 10000000).toFixed(2)} Cr
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
                      Base price ₹{selectedEvent.basePrice?.toLocaleString()}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
                    <div className="text-[11px] font-mono text-[var(--text-muted)] uppercase">Collision Risk Index</div>
                    <div className="mt-1 text-2xl font-black font-mono text-[var(--status-green)]">
                      {selectedEvent.safetyMetrics?.collisionRiskScore || '0.18'} <span className="text-xs font-bold text-[var(--status-green)]">(LOW)</span>
                    </div>
                    <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
                      {selectedEvent.safetyMetrics?.mitigatedDeconflictions || 14} choke points cleared
                    </div>
                  </div>
                </div>

                {/* Gates Strain Overview Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold font-mono text-[var(--text-primary)] uppercase">
                      Concourse Turnstile Strain &amp; Gate Balance
                    </h3>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                      Total {selectedEvent.totalTurnstiles || 64} electronic optical turnstiles
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {selectedEvent.gates?.map((gate) => {
                      const isHigh = gate.strainPct >= 85;
                      return (
                        <div 
                          key={gate.id} 
                          className={`rounded-xl border p-4 space-y-2.5 transition ${
                            isHigh 
                              ? 'border-[var(--terracotta-border)] bg-[var(--terracotta-tint)]' 
                              : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs font-mono text-[var(--text-primary)]">{gate.name}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                              gate.status === 'Strained'
                                ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                : gate.status === 'Heavy'
                                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            }`}>
                              {gate.status}
                            </span>
                          </div>

                          <div className="text-[11px] text-[var(--text-secondary)] line-clamp-1">{gate.label}</div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-mono">
                              <span className="text-[var(--text-muted)]">Strain</span>
                              <span className="font-bold text-[var(--text-primary)]">{gate.strainPct}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-[var(--bg-surface)] overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isHigh ? 'bg-[var(--terracotta-primary)]' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${gate.strainPct}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]/60">
                            <span>{gate.throughput} pax/min</span>
                            <span>Wait: ~{gate.waitMins}m</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: GATE BALANCER */}
            {activeTab === 'gates' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold font-mono text-[var(--text-primary)]">
                      Active Ingress Dynamic Flow Rebalancer
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Automatically diverts incoming digital ticket passes to adjacent low-strain turnstiles via push notifications.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--status-green)] animate-ping" />
                    <span className="text-xs font-mono font-bold text-[var(--status-green)]">ALGORITHM ENGAGED</span>
                  </div>
                </div>

                <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                      <tr>
                        <th className="p-3">GATE DESIGNATION</th>
                        <th className="p-3">ASSIGNED CORRIDOR</th>
                        <th className="p-3">CAPACITY</th>
                        <th className="p-3">THROUGHPUT</th>
                        <th className="p-3">CURRENT STRAIN</th>
                        <th className="p-3">EST. QUEUE TIME</th>
                        <th className="p-3">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] bg-[var(--bg-surface)]">
                      {selectedEvent.gates?.map((g) => (
                        <tr key={g.id} className="hover:bg-[var(--bg-elevated)]/50 transition">
                          <td className="p-3 font-bold text-[var(--text-primary)]">{g.name}</td>
                          <td className="p-3 text-[var(--text-secondary)]">{g.label}</td>
                          <td className="p-3 text-[var(--text-primary)]">{g.capacity.toLocaleString()} pax</td>
                          <td className="p-3 font-bold text-[var(--terracotta-text)]">{g.throughput} pax/min</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                                <div className="h-full bg-[var(--terracotta-primary)]" style={{ width: `${g.strainPct}%` }} />
                              </div>
                              <span className="font-bold">{g.strainPct}%</span>
                            </div>
                          </td>
                          <td className="p-3 font-bold text-[var(--text-primary)]">{g.waitMins} mins</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              g.status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                            }`}>
                              {g.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: TRANSIT & HOTELS */}
            {activeTab === 'transit' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                {/* Transit Modal Breakdown */}
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold font-mono text-[var(--text-primary)] uppercase flex items-center gap-2">
                      <Train className="w-4 h-4 text-[var(--terracotta-primary)]" />
                      <span>Transit Modal Split</span>
                    </h3>
                    <span className="text-xs font-mono text-[var(--text-muted)]">Real-time sync</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                          <Train className="w-3.5 h-3.5 text-blue-500" />
                          Suburban Rail &amp; Metro
                        </span>
                        <span className="font-bold text-[var(--text-primary)]">{selectedEvent.transitSplit?.railMetro || 42}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[var(--bg-surface)] overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedEvent.transitSplit?.railMetro || 42}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                          <Bus className="w-3.5 h-3.5 text-[var(--terracotta-primary)]" />
                          Official Electric Shuttles
                        </span>
                        <span className="font-bold text-[var(--text-primary)]">{selectedEvent.transitSplit?.shuttles || 28}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[var(--bg-surface)] overflow-hidden">
                        <div className="h-full bg-[var(--terracotta-primary)] rounded-full" style={{ width: `${selectedEvent.transitSplit?.shuttles || 28}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-amber-500" />
                          Park &amp; Ride Dedicated Lots
                        </span>
                        <span className="font-bold text-[var(--text-primary)]">{selectedEvent.transitSplit?.parkRide || 20}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[var(--bg-surface)] overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${selectedEvent.transitSplit?.parkRide || 20}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[var(--text-secondary)]">Rideshare &amp; Micromobility</span>
                        <span className="font-bold text-[var(--text-primary)]">{selectedEvent.transitSplit?.rideshare || 10}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[var(--bg-surface)] overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedEvent.transitSplit?.rideshare || 10}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hotel Lodging Absorption */}
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold font-mono text-[var(--text-primary)] uppercase flex items-center gap-2">
                      <Hotel className="w-4 h-4 text-[var(--terracotta-primary)]" />
                      <span>Peripheral Lodging Absorption</span>
                    </h3>
                    <span className="text-xs font-mono font-bold text-[var(--status-green)]">
                      {selectedEvent.hotelAbsorption?.ratePct || 88.4}% OCCUPIED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
                      <div className="text-[var(--text-muted)]">Rooms Absorbed</div>
                      <div className="text-lg font-black text-[var(--text-primary)] mt-1">
                        {selectedEvent.hotelAbsorption?.roomsBooked?.toLocaleString() || 1420} / {selectedEvent.hotelAbsorption?.totalRooms?.toLocaleString() || 1600}
                      </div>
                    </div>

                    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
                      <div className="text-[var(--text-muted)]">RevPAR Uplift</div>
                      <div className="text-lg font-black text-[var(--status-green)] mt-1">
                        +{selectedEvent.hotelAbsorption?.revparUpliftPct || 18.2}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs font-mono">
                    <span className="text-[var(--text-muted)]">Primary Partner Hotels in Radius:</span>
                    <ul className="space-y-1 text-[var(--text-secondary)]">
                      {selectedEvent.hotelAbsorption?.primaryHotels?.map((h, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[var(--status-green)]" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: LOGS & INCIDENT DISPATCH */}
            {activeTab === 'logs' && (
              <div className="space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
                  <span>LIVE CONCOURSE DISPATCH TIMELINE</span>
                  <span className="flex items-center gap-1 text-[var(--status-green)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-green)] animate-pulse" />
                    LIVE FEED
                  </span>
                </div>

                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 space-y-2.5 font-mono text-xs max-h-72 overflow-y-auto">
                  {selectedEvent.liveLogs?.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-3 border-b border-[var(--border-subtle)]/40 pb-2 last:border-0 last:pb-0">
                      <span className="text-[var(--text-muted)] shrink-0">{log.time}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 ${
                        log.type === 'alert'
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : log.type === 'success'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                      }`}>
                        {log.type}
                      </span>
                      <span className="text-[var(--text-primary)]">{log.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* CREATE EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--terracotta-primary)] text-white">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-lg font-bold font-mono text-[var(--text-primary)]">
                    Provision New Mega-Event
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Register FIFA fixture, Formula 1 Grand Prix, or Stadium Tour into the Stadia Mesh
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs font-mono">
              
              {/* Event Title */}
              <div className="space-y-1">
                <label className="text-[var(--text-secondary)] font-bold">EVENT TITLE *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Formula 1 Indian Grand Prix 2026 or FIFA Semifinal"
                  value={newEventForm.title}
                  onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-xs text-[var(--text-primary)] focus:border-[var(--terracotta-primary)] focus:outline-none"
                />
              </div>

              {/* Category & Sport */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] font-bold">CATEGORY *</label>
                  <select
                    value={newEventForm.category}
                    onChange={(e) => setNewEventForm({ ...newEventForm, category: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-xs text-[var(--text-primary)] focus:border-[var(--terracotta-primary)] focus:outline-none"
                  >
                    <option value="fifa">FIFA Football Championship</option>
                    <option value="f1">Formula 1 Grand Prix</option>
                    <option value="concert">Concert / Live Stadium Tour</option>
                    <option value="cricket">Cricket Derby / Tournament</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] font-bold">SUBTITLE / ROUND</label>
                  <input
                    type="text"
                    placeholder="e.g. Knockout Stage or Round 18 Championship"
                    value={newEventForm.subtitle}
                    onChange={(e) => setNewEventForm({ ...newEventForm, subtitle: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-xs text-[var(--text-primary)] focus:border-[var(--terracotta-primary)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Venue & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] font-bold">VENUE / ARENA *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DY Patil Stadium or Buddh International Circuit"
                    value={newEventForm.venue}
                    onChange={(e) => setNewEventForm({ ...newEventForm, venue: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-xs text-[var(--text-primary)] focus:border-[var(--terracotta-primary)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] font-bold">CITY / AREA *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Navi Mumbai or Greater Noida"
                    value={newEventForm.city}
                    onChange={(e) => setNewEventForm({ ...newEventForm, city: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-xs text-[var(--text-primary)] focus:border-[var(--terracotta-primary)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] font-bold">EVENT DATE *</label>
                  <input
                    type="date"
                    required
                    value={newEventForm.date}
                    onChange={(e) => setNewEventForm({ ...newEventForm, date: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-xs text-[var(--text-primary)] focus:border-[var(--terracotta-primary)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] font-bold">START / KICKOFF TIME</label>
                  <input
                    type="text"
                    placeholder="e.g. 18:00 IST or 15:00 IST"
                    value={newEventForm.time}
                    onChange={(e) => setNewEventForm({ ...newEventForm, time: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-xs text-[var(--text-primary)] focus:border-[var(--terracotta-primary)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Capacity & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] font-bold">TOTAL SEATING CAPACITY *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="e.g. 55000 or 120000"
                    value={newEventForm.capacity}
                    onChange={(e) => setNewEventForm({ ...newEventForm, capacity: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-xs text-[var(--text-primary)] focus:border-[var(--terracotta-primary)] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[var(--text-secondary)] font-bold">BASE TICKET PRICE (₹) *</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="e.g. 1500"
                    value={newEventForm.basePrice}
                    onChange={(e) => setNewEventForm({ ...newEventForm, basePrice: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-xs text-[var(--text-primary)] focus:border-[var(--terracotta-primary)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Organizer / Sanctioning Body */}
              <div className="space-y-1">
                <label className="text-[var(--text-secondary)] font-bold">ORGANIZING BODY / FEDERATION</label>
                <input
                  type="text"
                  placeholder="e.g. FIA / FIFA TMS / Live Nation"
                  value={newEventForm.organizer}
                  onChange={(e) => setNewEventForm({ ...newEventForm, organizer: e.target.value })}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-xs text-[var(--text-primary)] focus:border-[var(--terracotta-primary)] focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--terracotta-primary)] hover:bg-[var(--terracotta-hover)] px-5 py-2.5 text-xs font-bold text-white shadow-soft transition-all duration-150 active:scale-95"
                >
                  Provision Event into Mesh
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
