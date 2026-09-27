'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  MAHARASHTRA_VENUE_PRESETS, 
  createNewEvent 
} from '../../../../lib/eventsData.js';
import { 
  ArrowLeft, 
  CheckCircle, 
  ShieldAlert, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Sliders,
  Zap,
  Tag,
  Eye,
  Lock
} from '../../../../components/Icons.jsx';

export default function CreateEventPage() {
  const router = useRouter();

  const [selectedPresetId, setSelectedPresetId] = useState('dy-patil-nerul');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    category: 'cricket',
    categoryLabel: 'Cricket Match',
    sport: 'Cricket',
    venue: 'DY Patil Sports Stadium',
    city: 'Navi Mumbai',
    area: 'Nerul, Sector 7',
    lat: 19.04194,
    lng: 73.02667,
    date: '2026-06-20',
    time: '19:30 IST',
    duration: '3.5 hrs',
    capacity: 55000,
    basePrice: 1500,
    vipPrice: 8500,
    railSplit: 45,
    shuttleSplit: 28,
    parkSplit: 17,
    rideshareSplit: 10,
    organizer: 'BCCI / Executive Event Mesh',
    description: '',
    status: 'Draft', // 'Draft' | 'Published'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // When a venue preset is chosen, auto-fill location, coordinates, and default capacity
  const handlePresetChange = (presetId) => {
    setSelectedPresetId(presetId);
    if (presetId === 'custom') return;

    const preset = MAHARASHTRA_VENUE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setFormData(prev => ({
        ...prev,
        venue: preset.name,
        city: preset.city,
        area: preset.area,
        lat: preset.lat,
        lng: preset.lng,
        capacity: preset.capacity,
        description: `Stadia-orchestrated mega fixture at ${preset.name}, ${preset.city}. Integrated with ${preset.transitHubs}.`
      }));
    }
  };

  const handleCategoryChange = (cat) => {
    const labels = {
      cricket: { label: 'Tata IPL Cricket', sport: 'Cricket' },
      football: { label: 'FIFA / ISL Football', sport: 'Football' },
      concert: { label: 'Concerts & Live Music', sport: 'Music & Concert' },
      summit: { label: 'Global Expo & Tech Summit', sport: 'Conferences' },
      motorsport: { label: 'Motorsport Racing', sport: 'Motorsport' },
      kabaddi: { label: 'Pro Kabaddi League', sport: 'Kabaddi' },
    };
    const c = labels[cat] || { label: 'Live Event', sport: 'Sports' };
    setFormData(prev => ({
      ...prev,
      category: cat,
      categoryLabel: c.label,
      sport: c.sport
    }));
  };

  const handleSubmit = (targetStatus) => {
    if (!formData.title.trim()) {
      setErrorMsg('Please provide an event title');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        ...formData,
        status: targetStatus || formData.status,
      };

      const created = createNewEvent(payload);
      // Direct the executive organizer immediately to the event's analytics & management page
      router.push(`/organizer/events/${created.id}?created=true`);
    } catch (err) {
      console.error('Failed to create event:', err);
      setErrorMsg('Error registering event. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8 fade-up text-neutral-200">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <Link href="/organizer" className="hover:text-white transition flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Executive Organizer
            </Link>
            <span>/</span>
            <span className="text-emerald-400 font-bold">New Event Provisioning</span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Create &amp; Configure Mega-Event
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Setup schedule, venue topology, transit split, and publication lifecycle for Maharashtra.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/organizer"
            className="rounded-full border border-neutral-800 bg-[#121217] px-4 py-2 text-xs font-bold text-neutral-300 hover:bg-neutral-800 transition"
          >
            Cancel
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-300 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form Cards */}
      <div className="space-y-6">
        
        {/* Section 1: Event Identity */}
        <div className="rounded-2xl border border-neutral-800/80 bg-[#0e0e12] p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-neutral-800/60 pb-3">
            <Tag className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              1. Event Overview &amp; Category
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Event Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Tata IPL 2026 — Mumbai Indians vs Pune Super Giants"
                className="w-full rounded-xl border border-neutral-800 bg-[#14141a] px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-emerald-500 focus:outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Event Subtitle / Tagline
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g., Maharashtra Clásico · Group Stage Clash"
                className="w-full rounded-xl border border-neutral-800 bg-[#14141a] px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-emerald-500 focus:outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Organizer / Governing Body
              </label>
              <input
                type="text"
                value={formData.organizer}
                onChange={e => setFormData({ ...formData, organizer: e.target.value })}
                placeholder="e.g., BCCI &amp; IPL Operations"
                className="w-full rounded-xl border border-neutral-800 bg-[#14141a] px-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-emerald-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Event Domain / Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { id: 'cricket', name: 'Cricket', icon: '🏏' },
                { id: 'football', name: 'Football', icon: '⚽' },
                { id: 'concert', name: 'Concert', icon: '🎵' },
                { id: 'kabaddi', name: 'Kabaddi', icon: '🤼' },
                { id: 'summit', name: 'Conclave / Expo', icon: '🏛️' },
                { id: 'motorsport', name: 'Racing', icon: '🏎️' },
              ].map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition ${
                    formData.category === cat.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold'
                      : 'border-neutral-800 bg-[#14141a] text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs mt-1">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Maharashtra Venue Selection */}
        <div className="rounded-2xl border border-neutral-800/80 bg-[#0e0e12] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                2. Venue &amp; Maharashtra Location
              </h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Pre-Calibrated Ingress Grids
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MAHARASHTRA_VENUE_PRESETS.map(preset => {
              const active = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetChange(preset.id)}
                  className={`p-4 rounded-xl border text-left transition relative ${
                    active 
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/5' 
                      : 'border-neutral-800 bg-[#14141a] hover:border-neutral-700'
                  }`}
                >
                  {active && (
                    <div className="absolute top-3 right-3 text-emerald-400">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                  <div className="text-xs font-bold text-white leading-snug">{preset.name}</div>
                  <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1 font-mono">
                    <MapPin className="h-3 w-3 text-neutral-500" />
                    {preset.city} · {preset.area}
                  </div>
                  <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <span>Cap: {preset.capacity.toLocaleString('en-IN')}</span>
                    <span className="text-emerald-400">{preset.gates.length} Gates Mesh</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Venue Specific Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Venue Name
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={e => setFormData({ ...formData, venue: e.target.value })}
                className="w-full rounded-xl border border-neutral-800 bg-[#14141a] px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                City / Region
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full rounded-xl border border-neutral-800 bg-[#14141a] px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Concourse / Area
              </label>
              <input
                type="text"
                value={formData.area}
                onChange={e => setFormData({ ...formData, area: e.target.value })}
                className="w-full rounded-xl border border-neutral-800 bg-[#14141a] px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Schedule, Duration & Capacity */}
        <div className="rounded-2xl border border-neutral-800/80 bg-[#0e0e12] p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-neutral-800/60 pb-3">
            <Calendar className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              3. Schedule, Duration &amp; Capacity
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-neutral-500" /> Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-xl border border-neutral-800 bg-[#14141a] px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                <Clock className="h-3 w-3 text-neutral-500" /> Kickoff / Show Time
              </label>
              <input
                type="text"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                placeholder="19:30 IST"
                className="w-full rounded-xl border border-neutral-800 bg-[#14141a] px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                <Clock className="h-3 w-3 text-neutral-500" /> Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                placeholder="3.5 hrs"
                className="w-full rounded-xl border border-neutral-800 bg-[#14141a] px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                <Users className="h-3 w-3 text-neutral-500" /> Total Capacity
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full rounded-xl border border-neutral-800 bg-[#14141a] px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Ticketing Commercials */}
        <div className="rounded-2xl border border-neutral-800/80 bg-[#0e0e12] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-emerald-400">₹</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                4. Pricing &amp; Commercial Projections
              </h2>
            </div>
            <div className="text-xs font-mono text-emerald-400">
              Projected Gross: ₹{((formData.capacity * 0.85) * formData.basePrice).toLocaleString('en-IN')} (at 85% sellout)
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                General Admission Base Price (₹)
              </label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={e => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                className="w-full rounded-xl border border-neutral-800 bg-[#14141a] px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                VIP / Hospitality Stand Price (₹)
              </label>
              <input
                type="number"
                value={formData.vipPrice}
                onChange={e => setFormData({ ...formData, vipPrice: Number(e.target.value) })}
                className="w-full rounded-xl border border-neutral-800 bg-[#14141a] px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Multimodal Transit Split Defaults */}
        <div className="rounded-2xl border border-neutral-800/80 bg-[#0e0e12] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800/60 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                5. Fan Arrival Transit Split Assumptions
              </h2>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">
              Auto-calibrates gate ingress &amp; highway deconfliction
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            <div className="space-y-1 rounded-xl bg-[#14141a] p-3 border border-neutral-800">
              <span className="text-[11px] text-neutral-400 font-semibold block">Rail / Metro %</span>
              <input
                type="number"
                value={formData.railSplit}
                onChange={e => setFormData({ ...formData, railSplit: Number(e.target.value) })}
                className="w-full bg-transparent font-mono text-sm text-white font-bold focus:outline-none"
              />
              <span className="text-[10px] text-neutral-500 font-mono">Harbour / Western Rail</span>
            </div>

            <div className="space-y-1 rounded-xl bg-[#14141a] p-3 border border-neutral-800">
              <span className="text-[11px] text-neutral-400 font-semibold block">Electric Shuttles %</span>
              <input
                type="number"
                value={formData.shuttleSplit}
                onChange={e => setFormData({ ...formData, shuttleSplit: Number(e.target.value) })}
                className="w-full bg-transparent font-mono text-sm text-white font-bold focus:outline-none"
              />
              <span className="text-[10px] text-neutral-500 font-mono">NMMT &amp; Expressway Feeders</span>
            </div>

            <div className="space-y-1 rounded-xl bg-[#14141a] p-3 border border-neutral-800">
              <span className="text-[11px] text-neutral-400 font-semibold block">Park &amp; Ride Lots %</span>
              <input
                type="number"
                value={formData.parkSplit}
                onChange={e => setFormData({ ...formData, parkSplit: Number(e.target.value) })}
                className="w-full bg-transparent font-mono text-sm text-white font-bold focus:outline-none"
              />
              <span className="text-[10px] text-neutral-500 font-mono">Designated Lots P1-P4</span>
            </div>

            <div className="space-y-1 rounded-xl bg-[#14141a] p-3 border border-neutral-800">
              <span className="text-[11px] text-neutral-400 font-semibold block">Rideshare / Cabs %</span>
              <input
                type="number"
                value={formData.rideshareSplit}
                onChange={e => setFormData({ ...formData, rideshareSplit: Number(e.target.value) })}
                className="w-full bg-transparent font-mono text-sm text-white font-bold focus:outline-none"
              />
              <span className="text-[10px] text-neutral-500 font-mono">App Cabs &amp; Carpools</span>
            </div>
          </div>
        </div>

        {/* Section 6: Executive Publication Mode */}
        <div className="rounded-2xl border border-emerald-500/30 bg-[#0e1612] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                6. Executive Publication &amp; Go-Live Control
              </h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-400">
              You choose when fans can see and book
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Option A: Draft Mode */}
            <div 
              onClick={() => setFormData({ ...formData, status: 'Draft' })}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                formData.status === 'Draft'
                  ? 'border-amber-500 bg-amber-500/10 text-white shadow-md'
                  : 'border-neutral-800 bg-[#14141a]/60 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-bold text-white">Save as Staged Draft (Private)</span>
                </div>
                {formData.status === 'Draft' && <CheckCircle className="h-4 w-4 text-amber-400" />}
              </div>
              <p className="mt-2 text-xs text-neutral-300 leading-relaxed">
                The event will be created and saved in the Executive Console. You can review all simulated gate capacities, transit plans, and pricing analytics <strong>before</strong> publishing to fans.
              </p>
              <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-amber-300 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Hidden from public fan directory until you hit &quot;Put Live&quot;
              </div>
            </div>

            {/* Option B: Publish Immediately */}
            <div 
              onClick={() => setFormData({ ...formData, status: 'Published' })}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                formData.status === 'Published'
                  ? 'border-emerald-500 bg-emerald-500/15 text-white shadow-md'
                  : 'border-neutral-800 bg-[#14141a]/60 text-neutral-400 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Publish Immediately &amp; Go Live</span>
                </div>
                {formData.status === 'Published' && <CheckCircle className="h-4 w-4 text-emerald-400" />}
              </div>
              <p className="mt-2 text-xs text-neutral-300 leading-relaxed">
                The event will be immediately visible to public fans on the homepage and schedule. Fans can browse match details, choose seats, and book digital passes right away.
              </p>
              <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-emerald-300 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live on Public Fan App
              </div>
            </div>
          </div>
        </div>

        {/* Form Submission Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-neutral-800/80">
          <Link
            href="/organizer"
            className="w-full sm:w-auto text-center rounded-full border border-neutral-800 bg-[#14141a] px-6 py-2.5 text-xs font-bold text-neutral-300 hover:bg-neutral-800 transition"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit('Draft')}
            className="w-full sm:w-auto rounded-full border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 px-6 py-2.5 text-xs font-bold text-amber-300 transition flex items-center justify-center gap-2"
          >
            <Lock className="h-3.5 w-3.5" />
            Save as Draft (Private Staging)
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit('Published')}
            className="w-full sm:w-auto rounded-full bg-emerald-500 hover:bg-emerald-400 px-7 py-2.5 text-xs font-black text-black shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
          >
            <Eye className="h-3.5 w-3.5" />
            {isSubmitting ? 'Provisioning...' : 'Publish & Put Live to Fans'}
          </button>
        </div>

      </div>
    </div>
  );
}
