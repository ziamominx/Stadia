'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { api, useApi } from '../../lib/api.js';
import LiveGeospatialLayersHome from '../../components/LiveGeospatialLayersHome.jsx';
import { ArrowRight, Ticket, Navigation, MapPin, Utensils } from '../../components/Icons';
import './fan.css';

const actions = [
  { number: '01', title: 'Book a match', detail: 'Choose a fixture and reserve your seat.', href: '/matches', icon: Ticket },
  { number: '02', title: 'Open my pass', detail: 'Find your booking and entry details.', href: '/ticket', icon: Ticket },
  { number: '03', title: 'Plan my arrival', detail: 'Build a route to the venue.', href: '/journey-planner', icon: Navigation },
  { number: '04', title: 'Explore local perks', detail: 'See dining and hospitality options.', href: '/hospitality-hub', icon: Utensils },
];

function ActionRow({ action }) {
  const Icon = action.icon;
  return (
    <Link href={action.href} className="fx-action">
      <span className="fx-action-index">{action.number}</span>
      <span className="fx-action-icon" aria-hidden="true"><Icon className="h-5 w-5" /></span>
      <span className="fx-action-copy">
        <strong>{action.title}</strong>
        <small>{action.detail}</small>
      </span>
      <ArrowRight className="fx-arrow h-5 w-5" aria-hidden="true" />
    </Link>
  );
}

function FixtureList() {
  const { data, loading, error, reload } = useApi(api.matches);
  const fixtures = Array.isArray(data) ? data.slice(0, 3) : [];

  return (
    <div className="fx-fixtures" aria-live="polite">
      {loading ? (
        <div className="fx-fixture-loading" role="status" aria-label="Loading fixtures">
          <span /><span /><span />
        </div>
      ) : error ? (
        <div className="fx-fixture-state" role="alert">
          <p>Fixtures could not be loaded.</p>
          <button type="button" onClick={reload} className="fx-text-link">Try again <ArrowRight className="h-4 w-4" /></button>
        </div>
      ) : fixtures.length === 0 ? (
        <div className="fx-fixture-state" role="status">
          <p>No fixtures are available right now.</p>
          <Link href="/matches" className="fx-text-link">See all events <ArrowRight className="h-4 w-4" /></Link>
        </div>
      ) : fixtures.map((fixture, index) => (
        <Link key={fixture.id} href={`/match/${fixture.id}`} className="fx-fixture">
          <span className="fx-fixture-index">{String(index + 1).padStart(2, '0')}</span>
          <span className="fx-fixture-name">
            <strong>{fixture.home_team} <em>vs</em> {fixture.away_team}</strong>
            <small>{fixture.label || 'Match fixture'} · {fixture.venue}</small>
          </span>
          <span className="fx-fixture-cta">Select seats <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
        </Link>
      ))}
    </div>
  );
}

export default function FanExperiencePage() {
  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const sections = document.querySelectorAll('[data-fx-reveal]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('fx-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
    sections.forEach((section) => {
      section.classList.add('fx-reveal-ready');
      observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="fan-experience">
      <section className="fx-hero" aria-labelledby="fx-title">
        <div className="fx-hero-art" aria-hidden="true" />
        <div className="fx-hero-inner">
          <div className="fx-hero-copy">
            <p className="fx-kicker"><span className="fx-kicker-line" /> STADIA / FAN EXPERIENCE</p>
            <h1 id="fx-title">YOUR MATCHDAY.<br /><span>IN MOTION.</span></h1>
            <p className="fx-hero-summary">From the first seat selection to the final journey home. Your match, pass, and venue guide in one place.</p>
            <div className="fx-hero-actions">
              <Link href="/matches" className="fx-button fx-button-primary">Book a match <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link href="/ticket" className="fx-button fx-button-outline">View my digital pass <Ticket className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </div>
          <div className="fx-hero-bottom" aria-hidden="true">
            <span>DY PATIL STADIUM / NERUL</span>
            <span>SCROLL TO EXPLORE ↓</span>
          </div>
        </div>
      </section>

      <section className="fx-section fx-journey" aria-labelledby="fx-journey-title" data-fx-reveal>
        <div className="fx-section-heading">
          <div><p className="fx-eyebrow">01 / YOUR JOURNEY</p><h2 id="fx-journey-title">Everything for the day.</h2></div>
          <p>Start with a seat. The rest of your visit follows from your booking.</p>
        </div>
        <div className="fx-action-grid">{actions.map((action) => <ActionRow key={action.number} action={action} />)}</div>
      </section>

      <section className="fx-section fx-booking" aria-labelledby="fx-booking-title" data-fx-reveal>
        <div className="fx-booking-intro">
          <p className="fx-eyebrow">02 / THE MATCH</p>
          <h2 id="fx-booking-title">The moment<br /><span>starts here.</span></h2>
          <p>Explore the fixture preview, choose a seat, and keep the resulting pass in your wallet. Fixture and availability data in this build are for demonstration.</p>
          <Link href="/matches" className="fx-text-link">Browse all matches <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <FixtureList />
      </section>

      <section className="fx-section fx-pass-section" aria-labelledby="fx-pass-title" data-fx-reveal>
        <div className="fx-pass-copy">
          <p className="fx-eyebrow">03 / YOUR PASS</p>
          <h2 id="fx-pass-title">One pass.<br /><span>Your whole arrival.</span></h2>
          <p>Your booked ticket is the source for your seat, gate, and match details. Open the wallet to retrieve it or find a booking by ticket ID.</p>
          <Link href="/ticket" className="fx-button fx-button-primary">Open my pass <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <Link href="/ticket" className="fx-ticket-preview" aria-label="Open your digital pass wallet">
          <div className="fx-ticket-top"><span>STADIA / DIGITAL PASS</span><span>ACCESS 01</span></div>
          <div className="fx-ticket-body"><Ticket className="fx-ticket-symbol" aria-hidden="true" /><strong>YOUR SEAT<br />IS WAITING.</strong><span>Book a match to create your pass.</span></div>
          <div className="fx-ticket-bottom"><span>OPEN WALLET</span><ArrowRight className="h-5 w-5" aria-hidden="true" /></div>
        </Link>
      </section>

      <section className="fx-section fx-venue" id="venue-guide" aria-labelledby="fx-venue-title" data-fx-reveal>
        <div className="fx-section-heading">
          <div><p className="fx-eyebrow">04 / THE VENUE</p><h2 id="fx-venue-title">Know the ground.</h2></div>
          <p>Explore reference gate, transit, hotel, and shuttle layers around DY Patil Stadium.</p>
        </div>
        <div className="fx-venue-layout">
          <div className="fx-venue-guide">
            <span className="fx-venue-mark"><MapPin className="h-6 w-6" aria-hidden="true" /></span>
            <h3>Arrive with a plan.</h3>
            <p>Use the map to orient yourself before you travel. Your booked pass contains your assigned entry information; follow event staff and official signs on the day.</p>
            <div className="fx-venue-links">
              <Link href="/journey-planner" className="fx-text-link">Plan my journey <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link href="/hospitality-hub" className="fx-text-link">Explore hospitality <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
            <small>Map overlays are reference guides, not live crowd or vehicle telemetry.</small>
          </div>
          <LiveGeospatialLayersHome />
        </div>
      </section>

      <section className="fx-final" aria-labelledby="fx-final-title" data-fx-reveal>
        <div className="fx-final-inner">
          <p className="fx-eyebrow">THE DAY IS YOURS</p>
          <h2 id="fx-final-title">BE THERE FOR<br /><span>EVERY MOMENT.</span></h2>
          <div className="fx-final-actions">
            <Link href="/matches" className="fx-button fx-button-primary">Book a match <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link href="/ticket" className="fx-button fx-button-outline">My digital pass <Ticket className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
