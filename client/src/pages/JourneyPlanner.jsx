import { useState } from 'react';
import { api, useApi } from '../api.js';
import Stepper from '../components/Stepper.jsx';
import QRCodeCard from '../components/QRCode.jsx';
import { CheckCircle, Hotel, Sparkles, Zap, ArrowRight } from '../components/Icons.jsx';

const EVENT_ICONS = {
  sports_match: '⚽',
  mega_concert: '🎤',
  global_summit: '🏙️',
  cultural_festival: '🎭',
};

export default function JourneyPlanner() {
  const { data: eventData } = useApi(api.itineraryEvents);

  const [step, setStep] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState(1);
  const [attendeeType, setAttendeeType] = useState('outstation'); // 'local' | 'outstation'
  const [travelMode, setTravelMode] = useState('public_transit'); // 'public_transit' | 'personal_vehicle'
  const [earlyArrival, setEarlyArrival] = useState(true);
  const [itineraryResult, setItineraryResult] = useState(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [planError, setPlanError] = useState(null);

  const events = eventData?.events ?? [];

  const handleGeneratePlan = async () => {
    setIsPlanning(true);
    setPlanError(null);
    try {
      const res = await api.planItinerary({
        eventId: selectedEventId,
        attendeeType,
        travelMode,
        earlyArrivalPreference: earlyArrival,
      });
      setItineraryResult(res);
      setStep(2); // result / companion pass view
    } catch (err) {
      setPlanError(`Trip generation failed: ${err.message}`);
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mx-auto max-w-2xl border-b border-white/[0.07] pb-6 text-center">
        <span className="chip mx-auto border-volt-400/40 bg-volt-400/10 text-volt-300">
          <Sparkles className="h-3.5 w-3.5" /> Intelligent attendee mobility companion
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Plan your mega-event journey</h1>
        <p className="mt-2 text-sm text-slate-400">
          Avoid saturated hotel price gouging, bypass highway bottlenecks and claim exclusive off-peak arrival vouchers.
        </p>
      </div>

      <div className="flex justify-center">
        <Stepper steps={['Event & profile', 'Preferences & perks', 'Digital pass']} current={step} />
      </div>

      {/* Step 1: event & profile */}
      {step === 0 && (
        <div className="panel fade-up space-y-6 rounded-2xl p-6">
          <div>
            <label className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Select mega-event</label>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {events.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedEventId === ev.id
                      ? 'border-cyber-400/80 bg-cyber-400/10 shadow-[0_0_0_1px_rgba(56,189,248,0.45)]'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/25'
                  }`}
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyber-300">
                    {EVENT_ICONS[ev.event_type] ?? '🎟️'} {ev.event_type.replace('_', ' ')}
                  </span>
                  <h4 className="mt-1 text-sm font-bold leading-snug text-white">{ev.title}</h4>
                  <p className="mt-2 text-[11px] text-slate-400">{ev.venue}</p>
                </button>
              ))}
              {!events.length && <p className="text-sm text-slate-400">Loading events…</p>}
            </div>
          </div>

          <div className="grid gap-6 border-t border-white/[0.07] pt-4 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Visitor category</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { id: 'outstation', icon: '✈️', label: 'Outstation / Tourist', sub: 'Needs hotel + shuttle link' },
                  { id: 'local', icon: '🏠', label: 'Local Commuter', sub: 'Mumbai / MMR resident' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAttendeeType(opt.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      attendeeType === opt.id
                        ? 'border-cyber-400 bg-gradient-to-br from-cyber-500/20 to-volt-500/10 text-white'
                        : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25'
                    }`}
                  >
                    <div className="text-sm font-bold">{opt.icon} {opt.label}</div>
                    <div className="mt-1 text-[11px] text-slate-500">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Primary transit mode</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { id: 'public_transit', icon: '🚆', label: 'Metro / Rail / Shuttle', sub: 'Zero parking hassle' },
                  { id: 'personal_vehicle', icon: '🚗', label: 'Personal Vehicle', sub: 'Requires smart parking zone' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTravelMode(opt.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      travelMode === opt.id
                        ? 'border-cyber-400 bg-gradient-to-br from-cyber-500/20 to-volt-500/10 text-white'
                        : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25'
                    }`}
                  >
                    <div className="text-sm font-bold">{opt.icon} {opt.label}</div>
                    <div className="mt-1 text-[11px] text-slate-500">{opt.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={() => setStep(1)} className="btn-primary" disabled={!events.length}>
              Continue to preferences <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: preferences & perks */}
      {step === 1 && (
        <div className="panel fade-up space-y-6 rounded-2xl p-6">
          <div className="space-y-2">
            <h3 className="text-lg font-black tracking-tight text-white">Dynamic demand-balancing incentives</h3>
            <p className="text-xs text-slate-400">
              Help us distribute city traffic and claim valuable perks sponsored by event organizers and local merchants.
            </p>
          </div>

          <div className="space-y-4">
            <div
              onClick={() => setEarlyArrival(!earlyArrival)}
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                earlyArrival ? 'border-emerald-500/60 bg-emerald-500/[0.07]' : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip border-emerald-500/40 bg-emerald-500/10 text-emerald-300">Recommended · -40% queue</span>
                  <h4 className="text-sm font-bold text-white">Off-peak early arrival (T-3h to T-2h)</h4>
                </div>
                <p className="text-xs text-slate-400">
                  Arrive before peak ingress (4:30 PM – 5:30 PM). Get <strong className="text-slate-200">₹250 stadium food &amp; beverage voucher</strong> and <strong className="text-slate-200">priority turnstile access</strong>.
                </p>
              </div>
              <input type="checkbox" checked={earlyArrival} onChange={() => {}} className="h-5 w-5 shrink-0 accent-emerald-400" />
            </div>

            {attendeeType === 'outstation' && (
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hotel className="h-4 w-4 text-cyber-300" />
                    <h4 className="text-sm font-bold text-white">Automated zone re-balancing</h4>
                  </div>
                  <span className="chip border-emerald-500/40 bg-emerald-500/10 text-emerald-300">Save ~₹3,500/night</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-400">
                  The core stadium hotel cluster is at <strong className="text-slate-200">95% saturation</strong> with heavy surge pricing. We automatically route you to the <strong className="text-slate-200">Kharghar Green Valley Hub</strong> or <strong className="text-slate-200">Belapur Business Corridor</strong> with a complimentary <strong className="text-slate-200">express feeder shuttle pass</strong>.
                </p>
              </div>
            )}
          </div>

          {planError && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300">{planError}</div>
          )}

          <div className="flex justify-between border-t border-white/[0.07] pt-4">
            <button onClick={() => setStep(0)} className="btn-ghost">Back</button>
            <button disabled={isPlanning} onClick={handleGeneratePlan} className="btn-primary">
              {isPlanning ? 'Orchestrating journey…' : 'Generate my digital pass'} <Zap className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: digital pass & timeline */}
      {step === 2 && itineraryResult && (
        <div className="space-y-6">
          <div className="panel fade-up space-y-6 rounded-2xl bg-gradient-to-b from-ink-800 to-ink-900 p-6">
            <div className="flex flex-col items-start justify-between gap-4 border-b border-white/[0.07] pb-5 md:flex-row md:items-center">
              <div>
                <span className="chip border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
                  <CheckCircle className="h-3 w-3" /> Verified orchestrated pass
                </span>
                <h2 className="mt-2 text-xl font-black tracking-tight text-white">{itineraryResult.event.title}</h2>
                <p className="mt-0.5 text-xs text-slate-400">{itineraryResult.event.venue}</p>
              </div>

              <div className="glass flex items-center gap-4 rounded-2xl border border-white/10 p-3">
                <QRCodeCard text={itineraryResult.digitalPassId} size={72} />
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Pass identification</div>
                  <div className="font-mono text-xs font-bold text-white">{itineraryResult.digitalPassId}</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-emerald-300">Fast-track turnstile active</div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Recommended stay zone</div>
                <div className="mt-1 text-sm font-black text-white">{itineraryResult.recommendedZone.name}</div>
                <div className="mt-1 text-xs font-bold text-emerald-300">
                  Saved ₹{itineraryResult.estimatedSavings.toLocaleString('en-IN')} vs core cluster
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Dedicated gate allocation</div>
                <div className="mt-1 text-sm font-black text-white">{itineraryResult.assignedGate.name}</div>
                <div className="mt-1 text-xs capitalize text-slate-400">{itineraryResult.assignedGate.side} visitor corridor (separated flow)</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Active dynamic rewards</div>
                <div className="mt-1 text-sm font-black text-white">{itineraryResult.incentives.length} incentives claimed</div>
                <div className="mt-1 text-xs font-bold text-emerald-300">F&amp;B + free shuttle + dining</div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Claimed incentives &amp; perks</span>
              <div className="grid gap-3 sm:grid-cols-3">
                {itineraryResult.incentives.map((inc, i) => (
                  <div key={i} className="space-y-1 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-3 text-xs">
                    <div className="font-bold text-white">{inc.title}</div>
                    <div className="font-semibold text-emerald-300">{inc.reward}</div>
                    <div className="font-mono text-[10px] text-slate-500">CODE: {inc.code}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel fade-up space-y-6 rounded-2xl p-6">
            <div className="border-b border-white/[0.07] pb-4">
              <h3 className="text-base font-black tracking-tight text-white">Event-day orchestration timeline</h3>
              <p className="mt-1 text-xs text-slate-400">Synchronized schedule to avoid traffic bottlenecks and ensure smooth entry.</p>
            </div>

            <div className="space-y-6">
              {itineraryResult.timeline.map((t, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pl-1">
                  {idx < itineraryResult.timeline.length - 1 && (
                    <span className="absolute left-[13px] top-8 h-[calc(100%-8px)] w-px bg-gradient-to-b from-cyber-400/60 to-cyber-400/10" />
                  )}
                  <div className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyber-400/60 bg-cyber-400/10 text-[11px] font-extrabold text-cyber-300">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-extrabold uppercase tracking-wide text-cyber-300">{t.time}</span>
                      <span className="chip border-white/15 bg-white/[0.04] text-slate-300">{t.step}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{t.location}</h4>
                    <p className="text-xs leading-relaxed text-slate-400">{t.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center border-t border-white/[0.07] pt-4">
              <button onClick={() => setStep(0)} className="btn-ghost">Plan another trip</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
