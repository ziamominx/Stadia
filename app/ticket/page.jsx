'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api.js';
import { forgetWalletTicket, getWalletTicketIds, rememberWalletTicket } from '../../lib/passWallet.js';
import { ArrowRight, Ticket } from '../../components/Icons.jsx';
import './wallet.css';

export default function TicketWalletPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketInput, setTicketInput] = useState('');
  const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState('');

  useEffect(() => {
    let alive = true;
    async function loadWallet() {
      const ids = getWalletTicketIds();
      setLoading(true);
      const results = await Promise.all(ids.map(async (id) => {
        try { return { id, detail: await api.ticket(id) }; }
        catch { return { id, detail: null }; }
      }));
      if (alive) { setTickets(results); setLoading(false); }
    }
    loadWallet();
    window.addEventListener('stadia_wallet_updated', loadWallet);
    window.addEventListener('storage', loadWallet);
    return () => {
      alive = false;
      window.removeEventListener('stadia_wallet_updated', loadWallet);
      window.removeEventListener('storage', loadWallet);
    };
  }, []);

  const lookup = async (event) => {
    event.preventDefault();
    const id = ticketInput.trim();
    if (!id) { setLookupError('Enter a pass ID first.'); return; }
    setLookupError('');
    setLookupBusy(true);
    try {
      await api.ticket(id);
      rememberWalletTicket(id);
      router.push(`/ticket/${encodeURIComponent(id)}/confirmation`);
    } catch (error) {
      setLookupError(error.message || 'Pass not found. Check the ID and try again.');
      setLookupBusy(false);
    }
  };

  return (
    <div className="fw-wallet">
      <header className="fw-hero">
        <div className="fw-hero-inner">
          <p className="fw-eyebrow">STADIA / YOUR DIGITAL PASS</p>
          <h1>YOUR DAY.<br /><strong>YOUR PASS.</strong></h1>
          <p>Every pass booked on this device appears here. Open one to check the seat, entry gate, route, and QR code.</p>
        </div>
      </header>

      <div className="fw-body">
        <section className="fw-saved" aria-labelledby="fw-saved-title">
          <div className="fw-section-head"><div><p className="fw-eyebrow">01 / WALLET</p><h2 id="fw-saved-title">Saved passes.</h2></div><span>{loading ? 'LOADING' : `${tickets.length} ${tickets.length === 1 ? 'PASS' : 'PASSES'}`}</span></div>
          {loading ? (
            <div className="fw-loading" role="status" aria-label="Loading saved passes" />
          ) : tickets.length === 0 ? (
            <div className="fw-empty" role="status">
              <Ticket className="fw-empty-icon" aria-hidden="true" />
              <h3>No pass saved yet.</h3>
              <p>Choose a match and seat, then complete the demo reservation to create your pass.</p>
              <Link href="/matches" className="fw-primary-link">Book a match <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          ) : (
            <div className="fw-list">
              {tickets.map(({ id, detail }) => (
                <article key={id} className="fw-pass-row">
                  {detail ? (
                    <>
                      <div className="fw-pass-top"><span>STADIA / {id}</span><span>{detail.ticket.status}</span></div>
                      <h3>{detail.match.home_team} <em>vs</em> {detail.match.away_team}</h3>
                      <p>{detail.match.venue}</p>
                      <div className="fw-pass-meta"><span><small>ATTENDEE</small>{detail.ticket.user_name}</span><span><small>SEAT</small>Block {detail.block.block_name} / {detail.ticket.seat_number}</span><span><small>ENTRY</small>{detail.entryGate.name}</span></div>
                      <Link href={`/ticket/${encodeURIComponent(id)}/confirmation`} className="fw-pass-open">Open digital pass <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                    </>
                  ) : (
                    <div className="fw-unavailable"><div><strong>{id}</strong><p>This pass was not found on the booking server.</p></div><button type="button" onClick={() => forgetWalletTicket(id)}>Remove from this device</button></div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="fw-lookup" aria-labelledby="fw-lookup-title">
          <p className="fw-eyebrow">02 / PASS LOOKUP</p>
          <h2 id="fw-lookup-title">Have a pass ID?</h2>
          <p>Enter the ID from a booking confirmation to save that pass on this device.</p>
          <form onSubmit={lookup}>
            <label htmlFor="wallet-ticket-id">PASS ID</label>
            <input id="wallet-ticket-id" type="text" autoComplete="off" value={ticketInput} onChange={(event) => setTicketInput(event.target.value)} placeholder="STADIA-…" />
            {lookupError && <p role="alert" className="fw-error">{lookupError}</p>}
            <button type="submit" disabled={lookupBusy}>{lookupBusy ? 'Checking pass…' : 'Find my pass'} <ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
          </form>
          <div className="fw-note">These QR passes are part of a local demo. No payment is taken and they do not grant entry to a real venue.</div>
        </aside>
      </div>
    </div>
  );
}
