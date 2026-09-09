import React, { useState, useEffect } from 'react';
import { api, useApi } from '../api.js';
import QRCode from '../components/QRCode.jsx';
import { Navigation, Hotel, Bus, Shield, Sparkles, CheckCircle, Clock, ArrowRight, Zap, Utensils } from '../components/Icons.jsx';

export default function JourneyPlanner() {
  const { data: eventData } = useApi(api.itineraryEvents);

  const [step, setStep] = useState(1);
  const [selectedEventId, setSelectedEventId] = useState(1);
  const [attendeeType, setAttendeeType] = useState('outstation'); // 'local' or 'outstation'
  const [travelMode, setTravelMode] = useState('public_transit'); // 'public_transit' or 'personal_vehicle'
  const [earlyArrival, setEarlyArrival] = useState(true);
  const [itineraryResult, setItineraryResult] = useState(null);
  const [isPlanning, setIsPlanning] = useState(false);

  const events = eventData?.events || [
    { id: 1, title: "FIFA Women's World Cup 2026: India vs Australia (Opening Match)", event_type: "sports_match", venue: "DY Patil Stadium, Nerul", date_time: "2026-10-12T19:30:00.000Z" },
    { id: 2, title: "Coldplay: Music of the Spheres Mega Stadium Tour", event_type: "mega_concert", venue: "DY Patil Stadium, Nerul", date_time: "2026-10-18T18:00:00.000Z" },
    { id: 3, title: "Global AI & Sustainable Urbanism Summit 2026", event_type: "global_summit", venue: "CIDCO Exhibition & Convention Center", date_time: "2026-10-24T09:00:00.000Z" }
  ];

  const handleGeneratePlan = async () => {
    setIsPlanning(true);
    try {
      const res = await api.planItinerary({
        eventId: selectedEventId,
        attendeeType,
        travelMode,
        earlyArrivalPreference: earlyArrival
      });
      setItineraryResult(res);
      setStep(3); // Result / Companion Pass view
    } catch (err) {
      alert(`Trip generation failed: ${err.message}`);
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8 fade-up">
      {/* Header */}
      <div className="border-b border-neutral-800/80 pb-6 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <Sparkles className="h-3.5 w-3.5" />
          Intelligent Attendee Mobility & Hospitality Companion
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Plan Your Mega-Event Journey
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Avoid saturated hotel price gouging, bypass highway bottlenecks, and claim exclusive off-peak arrival vouchers.
        </p>
      </div>

      {/* Stepper Progress */}
      <div className="flex items-center justify-center gap-3">
        {[
          { n: 1, label: '1. Event & Profile' },
          { n: 2, label: '2. Preferences & Perks' },
          { n: 3, label: '3. Digital Pass & Timeline' },
        ].map((s) => (
          <div
            key={s.n}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              step >= s.n
                ? 'bg-white text-black'
                : 'border border-neutral-800 bg-[#111114] text-neutral-400'
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* Step 1: Event & Profile */}
      {step === 1 && (
        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-2xl space-y-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Select Mega-Event</label>
            <div className="grid sm:grid-cols-3 gap-3 mt-2">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    selectedEventId === ev.id
                      ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                      : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase text-emerald-400">{ev.event_type.replace('_', ' ')}</span>
                  <h4 className="mt-1 text-sm font-bold text-white leading-snug">{ev.title}</h4>
                  <p className="mt-2 text-[11px] text-neutral-400">{ev.venue}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-neutral-800">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Visitor Category</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setAttendeeType('outstation')}
                  className={`rounded-2xl border p-4 text-left transition ${
                    attendeeType === 'outstation'
                      ? 'border-white bg-white text-black font-bold'
                      : 'border-neutral-800 bg-neutral-900/50 text-neutral-300'
                  }`}
                >
                  <div className="text-sm">✈️ Outstation / Tourist</div>
                  <div className="text-[11px] mt-1 opacity-75">Needs hotel + shuttle link</div>
                </button>

                <button
                  type="button"
                  onClick={() => setAttendeeType('local')}
                  className={`rounded-2xl border p-4 text-left transition ${
                    attendeeType === 'local'
                      ? 'border-white bg-white text-black font-bold'
                      : 'border-neutral-800 bg-neutral-900/50 text-neutral-300'
                  }`}
                >
                  <div className="text-sm">🏠 Local Commuter</div>
                  <div className="text-[11px] mt-1 opacity-75">Mumbai / MMR resident</div>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Primary Transit Mode</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setTravelMode('public_transit')}
                  className={`rounded-2xl border p-4 text-left transition ${
                    travelMode === 'public_transit'
                      ? 'border-white bg-white text-black font-bold'
                      : 'border-neutral-800 bg-neutral-900/50 text-neutral-300'
                  }`}
                >
                  <div className="text-sm">🚆 Metro / Rail / Shuttle</div>
                  <div className="text-[11px] mt-1 opacity-75">Zero parking hassle</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTravelMode('personal_vehicle')}
                  className={`rounded-2xl border p-4 text-left transition ${
                    travelMode === 'personal_vehicle'
                      ? 'border-white bg-white text-black font-bold'
                      : 'border-neutral-800 bg-neutral-900/50 text-neutral-300'
                  }`}
                >
                  <div className="text-sm">🚗 Personal Vehicle</div>
                  <div className="text-[11px] mt-1 opacity-75">Requires smart parking zone</div>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-bold text-black hover:bg-neutral-200 transition"
            >
              Continue to Preferences
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Preferences & Perks */}
      {step === 2 && (
        <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-2xl space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Dynamic Demand Balancing Incentives</h3>
            <p className="text-xs text-neutral-400">
              Help us distribute city traffic and claim valuable perks sponsored by event organizers and local merchants.
            </p>
          </div>

          <div className="space-y-4">
            {/* Early Ingress Nudge */}
            <div
              onClick={() => setEarlyArrival(!earlyArrival)}
              className={`cursor-pointer rounded-2xl border p-4 transition flex items-center justify-between ${
                earlyArrival
                  ? 'border-emerald-500/80 bg-emerald-950/20'
                  : 'border-neutral-800 bg-neutral-900/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                    RECOMMENDED · -40% QUEUE
                  </span>
                  <h4 className="text-sm font-bold text-white">Off-Peak Early Arrival (T-3h to T-2h)</h4>
                </div>
                <p className="text-xs text-neutral-400">
                  Arrive before peak ingress (4:30 PM - 5:30 PM). Get <strong>₹250 stadium food & beverage voucher</strong> and <strong>Priority Turnstile Access</strong>.
                </p>
              </div>

              <input
                type="checkbox"
                checked={earlyArrival}
                onChange={() => {}}
                className="h-5 w-5 rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-0"
              />
            </div>

            {/* Smart Peripheral Accommodation Advantage */}
            {attendeeType === 'outstation' && (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hotel className="h-4 w-4 text-blue-400" />
                    <h4 className="text-sm font-bold text-white">Automated Zone Re-balancing</h4>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">Save ~₹3,500/night</span>
                </div>
                <p className="text-xs text-neutral-400">
                  The core stadium hotel cluster is at <strong>95% saturation</strong> with heavy surge pricing. We automatically route you to the <strong>Kharghar Green Valley Hub</strong> or <strong>Belapur Business Corridor</strong> with a complimentary <strong>Express Feeder Shuttle pass</strong>.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-neutral-800">
            <button
              onClick={() => setStep(1)}
              className="rounded-full border border-neutral-800 bg-neutral-900 px-5 py-2 text-xs font-semibold text-neutral-300 hover:text-white"
            >
              Back
            </button>
            <button
              disabled={isPlanning}
              onClick={handleGeneratePlan}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-bold text-black hover:bg-neutral-200 transition disabled:opacity-50"
            >
              {isPlanning ? 'Orchestrating Journey...' : 'Generate My Digital Pass'}
              <Zap className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Digital Pass & Turn-by-Turn Timeline */}
      {step === 3 && itineraryResult && (
        <div className="space-y-6">
          {/* Digital Pass Card */}
          <div className="rounded-3xl border border-neutral-800/80 bg-gradient-to-br from-[#141418] to-[#0d0d10] p-6 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                  <CheckCircle className="h-3 w-3" />
                  Verified Orchestrated Pass
                </span>
                <h2 className="mt-2 text-xl font-black text-white">{itineraryResult.event.title}</h2>
                <p className="text-xs text-neutral-400 mt-0.5">{itineraryResult.event.venue} · Kickoff 19:30 IST</p>
              </div>

              <div className="flex items-center gap-4 bg-neutral-900/80 p-3 rounded-2xl border border-neutral-800">
                <QRCode value={itineraryResult.digitalPassId} size={72} />
                <div>
                  <div className="text-[10px] uppercase font-bold text-neutral-500">Pass Identification</div>
                  <div className="text-xs font-mono font-bold text-white">{itineraryResult.digitalPassId}</div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-1">Fast-Track Turnstile Active</div>
                </div>
              </div>
            </div>

            {/* Allocated Route & Vouchers */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
                <div className="text-[10px] uppercase text-neutral-400 font-bold">Recommended Stay Zone</div>
                <div className="text-sm font-black text-white mt-1">{itineraryResult.recommendedZone.name}</div>
                <div className="text-xs text-emerald-400 font-semibold mt-1">
                  Saved ₹{itineraryResult.estimatedSavings.toLocaleString('en-IN')} vs core cluster
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
                <div className="text-[10px] uppercase text-neutral-400 font-bold">Dedicated Gate Allocation</div>
                <div className="text-sm font-black text-white mt-1">{itineraryResult.assignedGate.name}</div>
                <div className="text-xs text-neutral-400 mt-1 capitalize">
                  {itineraryResult.assignedGate.side} Visitor Corridor (Separated Flow)
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
                <div className="text-[10px] uppercase text-neutral-400 font-bold">Active Dynamic Rewards</div>
                <div className="text-sm font-black text-white mt-1">{itineraryResult.incentives.length} Incentives Claimed</div>
                <div className="text-xs text-emerald-400 mt-1 font-semibold">F&B + Free Shuttle + Dining</div>
              </div>
            </div>

            {/* Claimed Incentives Strip */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Claimed Incentives & Perks</span>
              <div className="grid sm:grid-cols-3 gap-3">
                {itineraryResult.incentives.map((inc, i) => (
                  <div key={i} className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-3 text-xs space-y-1">
                    <div className="font-bold text-white">{inc.title}</div>
                    <div className="text-emerald-400 font-semibold">{inc.reward}</div>
                    <div className="text-[10px] text-neutral-400 font-mono">CODE: {inc.code}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Turn-by-Turn Dynamic Event Day Timeline */}
          <div className="rounded-3xl border border-neutral-800/80 bg-[#111114] p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
              <div>
                <h3 className="text-base font-bold text-white">Event-Day Orchestration Timeline</h3>
                <p className="text-xs text-neutral-400">Synchronized schedule to avoid traffic bottlenecks and ensure smooth entry.</p>
              </div>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-neutral-800">
              {itineraryResult.timeline.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pl-1">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-[#09090b] text-[11px] font-bold text-white z-10">
                    {idx + 1}
                  </div>
                  <div className="flex-1 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">{step.time}</span>
                      <span className="text-[10px] rounded-full bg-neutral-800 px-2 py-0.5 text-neutral-300 font-semibold">
                        {step.step}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{step.location}</h4>
                    <p className="text-xs text-neutral-400">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-4 border-t border-neutral-800">
              <button
                onClick={() => setStep(1)}
                className="rounded-full border border-neutral-800 bg-neutral-900 px-6 py-2 text-xs font-semibold text-neutral-300 hover:text-white"
              >
                Plan Another Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
