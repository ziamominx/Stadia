'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useApi, api } from '../../../../lib/api.js';
import { rememberWalletTicket } from '../../../../lib/passWallet.js';
import QRCodeCard from '../../../../components/QRCode.jsx';
import RouteMap from '../../../../components/RouteMap.jsx';
import { kickoffLong } from '../../../../lib/format.js';
import { ArrowRight, Ticket } from '../../../../components/Icons';
import './pass.css';

export default function ConfirmationPage() {
  const params = useParams();
  const ticketId = params?.ticketId;
  const { data: detail, loading, error, reload } = useApi(() => api.ticket(ticketId), [ticketId]);
  const [copyMessage, setCopyMessage] = useState('');
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    if (detail?.ticket?.unique_ticket_id) rememberWalletTicket(detail.ticket.unique_ticket_id);
  }, [detail]);

  if (loading) return <div className="fp-shell"><div className="fp-loading" role="status" aria-label="Loading digital pass" /></div>;
  if (error || !detail) return <div className="fp-shell fp-error-state" role="alert"><h1>Pass not found.</h1><p>{error?.message || 'Check the ticket ID and try again.'}</p><div><button type="button" onClick={reload}>Try again</button><Link href="/ticket">Back to my passes <ArrowRight className="h-4 w-4" /></Link></div></div>;

  const ticket = detail.ticket;
  const passId = ticket.unique_ticket_id;
  const qrPayload = JSON.stringify({ type: 'STADIA_DEMO_PASS', id: passId, matchId: detail.match.id, seat: ticket.seat_number });

  const copyId = async () => {
    try { await navigator.clipboard.writeText(passId); setCopyMessage('Pass ID copied.'); }
    catch { setCopyMessage(`Copy unavailable. Your ID is ${passId}.`); }
  };
  const downloadQr = async () => {
    setDownloadError('');
    try {
      const url = await QRCode.toDataURL(qrPayload, { width: 512, margin: 2, color: { dark: '#090909', light: '#ffffff' } });
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `stadia-demo-pass-${passId}.png`;
      anchor.click();
    } catch { setDownloadError('Could not download the QR image. Please try again.'); }
  };

  return <div className="fp-pass-page">
    <div className="fp-shell">
      <div className="fp-breadcrumb"><Link href="/ticket">← My passes</Link><span> / {passId}</span></div>
      <header className="fp-heading"><div><p className="fp-eyebrow">STADIA / DIGITAL PASS</p><h1>YOUR PASS.<br /><strong>READY TO VIEW.</strong></h1><p>{detail.match.home_team} vs {detail.match.away_team} · {detail.match.venue}</p></div><span className="fp-demo-tag">DEMO RESERVATION</span></header>
      <div className="fp-disclaimer" role="note">This QR is generated for the Stadia demo. It is not a real event ticket, payment receipt, hotel booking, parking permit, or venue-entry credential.</div>

      <div className="fp-layout">
        <section className="fp-card" aria-label="Digital pass details">
          <div className="fp-card-top"><span>STADIA / MATCHDAY</span><span>{ticket.status?.toUpperCase() || 'CONFIRMED'}</span></div>
          <div className="fp-card-event"><span>MATCH</span><h2>{detail.match.home_team}<br /><em>vs</em> {detail.match.away_team}</h2><p>{kickoffLong(detail.match.kickoff_time)}<br />{detail.match.venue}</p></div>
          <div className="fp-card-facts"><div><small>ATTENDEE</small><strong>{ticket.user_name}</strong></div><div><small>BLOCK</small><strong>{detail.block.block_name}</strong></div><div><small>SEAT</small><strong>{ticket.seat_number}</strong></div><div><small>ENTRY GATE</small><strong>{detail.entryGate.name}</strong></div></div>
          <div className="fp-card-qr"><QRCodeCard text={qrPayload} size={172} /><div><span>DEMO QR / PASS ID</span><strong>{passId}</strong><p>Keep this page or download the QR image for the demo walkthrough.</p></div></div>
        </section>

        <aside className="fp-side">
          <div className="fp-actions"><p className="fp-eyebrow">01 / PASS ACTIONS</p><h2>Keep it close.</h2><button type="button" onClick={downloadQr}>Download QR image <ArrowRight className="h-4 w-4" aria-hidden="true" /></button><button type="button" onClick={copyId}>Copy pass ID <Ticket className="h-4 w-4" aria-hidden="true" /></button><p role="status" aria-live="polite">{copyMessage || downloadError}</p></div>
          <div className="fp-arrival"><p className="fp-eyebrow">02 / ARRIVAL REFERENCE</p><h2>Find your way.</h2><div><span>Assigned entry</span><strong>{detail.entryGate.name}</strong></div><div><span>Exit reference</span><strong>{detail.exitGate.name}</strong></div>{detail.parkingZone && <div><span>Parking reference</span><strong>{detail.parkingZone.name}</strong></div>}{detail.hotel && <div><span>Stay reference</span><strong>{detail.hotel.name}</strong></div>}<p>Route lines are illustrative. Confirm real gates, road access, and services with the event organizer.</p></div>
        </aside>
      </div>

      <section className="fp-route"><div><p className="fp-eyebrow">03 / VENUE MAP</p><h2>See the approach.</h2><p>OpenStreetMap base map with reference entry and exit lines.</p></div><RouteMap route={detail.route} height="h-[420px]" /></section>
      <div className="fp-bottom-links"><Link href="/matches">Book another match <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link><Link href="/ticket">All my passes <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
    </div>
  </div>;
}
