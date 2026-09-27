'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api, useApi } from '../../lib/api.js';
import { ArrowRight, Hotel, Utensils } from '../../components/Icons';

export default function HospitalityHubPage() {
  const { data, error, loading, reload } = useApi(api.fanPerks);
  const [activeTab, setActiveTab] = useState('offers');
  const [copyStatus, setCopyStatus] = useState('');
  const offers = data?.offers || [];
  const areas = data?.areas || [];

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus(code + ' copied to clipboard.');
    } catch {
      setCopyStatus('Copy unavailable. Use the displayed code ' + code + '.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 sm:pt-20">
        <div className="grid gap-10 border-b border-white/20 pb-12 lg:grid-cols-[1fr_300px] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">Stadia / Fan experience / 03</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-light uppercase leading-[0.98] tracking-[-0.065em] sm:text-7xl">
              Make more of <span className="font-bold">matchday.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-neutral-300 sm:text-base">
              Explore example dining offers and accommodation areas around DY Patil Stadium. Plan your onward trip before the final whistle.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/matches" className="inline-flex items-center gap-2 border border-white bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-black transition hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                Find a match <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/journey-planner" className="inline-flex items-center gap-2 border border-white/30 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white transition hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                Plan your journey <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="border-l border-white/30 pl-5 text-sm leading-6 text-neutral-400">
            <span className="block text-4xl font-light text-white">01 / 02</span>
            <p className="mt-4">Browse a meal after the match, then check nearby areas and transit links for your stay.</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/20 pb-4">
          <div className="flex gap-6" role="group" aria-label="Fan perks sections">
            <button type="button" aria-pressed={activeTab === 'offers'} onClick={() => setActiveTab('offers')} className={'pb-3 text-xs font-semibold uppercase tracking-[0.14em] transition focus-visible:outline-2 focus-visible:outline-white ' + (activeTab === 'offers' ? 'border-b-2 border-white text-white' : 'text-neutral-500 hover:text-white')}>
              Dining & perks <span className="ml-1 text-neutral-500">{offers.length.toString().padStart(2, '0')}</span>
            </button>
            <button type="button" aria-pressed={activeTab === 'areas'} onClick={() => setActiveTab('areas')} className={'pb-3 text-xs font-semibold uppercase tracking-[0.14em] transition focus-visible:outline-2 focus-visible:outline-white ' + (activeTab === 'areas' ? 'border-b-2 border-white text-white' : 'text-neutral-500 hover:text-white')}>
              Stay & travel <span className="ml-1 text-neutral-500">{areas.length.toString().padStart(2, '0')}</span>
            </button>
          </div>
          <p className="max-w-md text-xs leading-5 text-neutral-500">Reference content for this demo. Confirm any offer or hotel availability with the provider before making plans.</p>
        </div>

        {loading && <p className="py-16 text-sm text-neutral-400" role="status">Loading fan perks…</p>}
        {!loading && error && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/20 py-12" role="alert">
            <p className="text-sm text-neutral-300">Fan perks are unavailable right now. {error.message}</p>
            <button type="button" onClick={reload} className="border border-white/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:border-white">Try again</button>
          </div>
        )}

        {!loading && !error && activeTab === 'offers' && (
          <section id="fan-offers" aria-label="Dining and fan zones" className="pt-8">
            <div className="mb-7 flex items-center gap-3"><Utensils className="h-5 w-5" /><h2 className="text-xl font-light uppercase tracking-[-0.03em]">Dining & fan zones</h2></div>
            {offers.length === 0 ? <p className="py-12 text-sm text-neutral-400">No example offers are available.</p> : (
              <div className="grid border-l border-t border-white/20 md:grid-cols-2 xl:grid-cols-3">
                {offers.map((offer, index) => (
                  <article key={offer.id} className="flex min-h-72 flex-col justify-between border-b border-r border-white/20 p-6 transition hover:bg-white/[0.04]">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">{String(index + 1).padStart(2, '0')} / {offer.zone}</p>
                        <span className="text-sm font-semibold text-white">{offer.discountPct}% off</span>
                      </div>
                      <h3 className="mt-9 text-2xl font-light tracking-[-0.04em]">{offer.name}</h3>
                      <p className="mt-3 text-sm leading-6 text-neutral-400">{offer.description}</p>
                    </div>
                    <div className="mt-8 flex flex-wrap items-end justify-between gap-3 border-t border-white/20 pt-4">
                      <div><span className="block text-[10px] uppercase tracking-widest text-neutral-500">Example code</span><span className="mt-1 block font-mono text-xs text-white">{offer.code}</span></div>
                      <button type="button" onClick={() => copyCode(offer.code)} className="border border-white/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest transition hover:border-white hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Copy code</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <p role="status" aria-live="polite" className="min-h-8 pt-3 text-xs text-neutral-400">{copyStatus}</p>
          </section>
        )}

        {!loading && !error && activeTab === 'areas' && (
          <section id="fan-areas" aria-label="Accommodation areas" className="pt-8">
            <div className="mb-7 flex items-center gap-3"><Hotel className="h-5 w-5" /><h2 className="text-xl font-light uppercase tracking-[-0.03em]">Areas to consider</h2></div>
            {areas.length === 0 ? <p className="py-12 text-sm text-neutral-400">No accommodation areas are available.</p> : (
              <div className="border-t border-white/20">
                {areas.map((area, index) => (
                  <div key={area.id} className="grid gap-3 border-b border-white/20 py-6 sm:grid-cols-[65px_1fr_1fr] sm:items-center">
                    <span className="font-mono text-xs text-neutral-500">{String(index + 1).padStart(2, '0')}</span>
                    <h3 className="text-xl font-light tracking-[-0.04em]">{area.name}</h3>
                    <p className="text-sm text-neutral-400">{area.transit}</p>
                  </div>
                ))}
              </div>
            )}
            <Link href="/journey-planner" className="mt-8 inline-flex items-center gap-2 border-b border-white pb-2 text-xs font-semibold uppercase tracking-wider hover:text-neutral-300">Build a travel plan <ArrowRight className="h-4 w-4" /></Link>
          </section>
        )}
      </div>
    </div>
  );
}
