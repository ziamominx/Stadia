'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, useApi } from '../../lib/api.js';
import { getPublicEvents } from '../../lib/eventsData.js';
import { ArrowRight, Ticket } from '../../components/Icons';
import './matches.css';

export default function MatchesPage() {
  const { data, loading, error, reload } = useApi(api.matches);
  const [publicEvents, setPublicEvents] = useState([]);
  const fixtures = Array.isArray(data) ? data : [];

  useEffect(() => {
    const loadEvents = () => setPublicEvents(getPublicEvents());
    loadEvents();
    window.addEventListener('stadia_events_updated', loadEvents);
    return () => window.removeEventListener('stadia_events_updated', loadEvents);
  }, []);

  return (
    <div className="fan-matches">
      <header className="fm-hero">
        <div className="fm-hero-inner">
          <p className="fm-eyebrow">STADIA / MATCH BOOKING</p>
          <h1>FIND YOUR<br /><strong>SEAT.</strong></h1>
          <div className="fm-hero-bottom">
            <p>Choose an event, select a block and seat, and generate a digital pass in the demo booking flow.</p>
            <Link href="/ticket" className="fm-outline-link">My digital pass <Ticket className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </header>

      <div className="fm-body">
        {publicEvents.length > 0 && (
          <section className="fm-section" aria-labelledby="fm-events-title">
            <div className="fm-heading"><div><p className="fm-eyebrow">01 / PUBLISHED EVENTS</p><h2 id="fm-events-title">Event selection.</h2></div><p>Events published in this local workspace.</p></div>
            <div className="fm-list">
              {publicEvents.map((event, index) => (
                <Link href={`/match/${event.id}`} className="fm-row" key={event.id}>
                  <span className="fm-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="fm-row-main"><strong>{event.title}</strong><small>{event.venue}{event.city ? ` · ${event.city}` : ''}</small></span>
                  <span className="fm-row-action">Select seats <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="fm-section" aria-labelledby="fm-fixtures-title">
          <div className="fm-heading"><div><p className="fm-eyebrow">{publicEvents.length ? '02' : '01'} / FIXTURE PREVIEW</p><h2 id="fm-fixtures-title">Explore the matches.</h2></div><p>These fixtures and seat counts are sample data for the demo.</p></div>
          {loading ? (
            <div className="fm-loading" role="status" aria-label="Loading fixtures"><span /><span /><span /></div>
          ) : error ? (
            <div className="fm-state" role="alert"><p>Matches could not be loaded. {error.message}</p><button type="button" onClick={reload}>Try again <ArrowRight className="h-4 w-4" /></button></div>
          ) : fixtures.length === 0 ? (
            <div className="fm-state" role="status">No match fixtures are available right now.</div>
          ) : (
            <div className="fm-list">
              {fixtures.map((match, index) => (
                <Link href={`/match/${match.id}`} className="fm-row" key={match.id}>
                  <span className="fm-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="fm-row-main"><strong>{match.home_team} <em>vs</em> {match.away_team}</strong><small>{match.label || 'Match fixture'} · {match.venue}</small></span>
                  <span className="fm-row-action">Select seats <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                </Link>
              ))}
            </div>
          )}
        </section>
        <aside className="fm-note"><Ticket className="h-5 w-5" aria-hidden="true" /><p>This is a demonstration reservation system. A generated pass is saved to this device and can be retrieved by its ID. No payment is taken and the pass is not valid for real venue entry.</p></aside>
      </div>
    </div>
  );
}
