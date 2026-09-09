function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function buildMessage(d) {
  const t = d.ticket;
  const lines = [];
  lines.push(`🏟️ *FIFA Women's World Cup India 2026*`);
  lines.push(`🎫 Ticket confirmed: ${t.unique_ticket_id}`);
  lines.push('');
  lines.push(`⚽ ${d.match.home_team} vs ${d.match.away_team}`);
  lines.push(`🕐 ${fmtTime(d.match.kickoff_time)}`);
  lines.push(`📍 ${d.match.venue}`);
  lines.push(`💺 Block ${d.block.block_name} · Seat ${t.seat_number}`);
  lines.push('');

  if (t.visitor_type === 'local') {
    lines.push(`🚪 Entry: ${d.entryGate?.name}`);
    lines.push(`🚪 Exit: ${d.exitGate?.name}`);
    if (d.parkingZone) {
      lines.push(`🅿️ Parking: ${d.parkingZone.name}`);
      lines.push('🚶 Post-match: walk back to your parking zone via the exit gate.');
    } else if (d.transitHint) {
      lines.push(`🚆 Transit: ${d.transitHint}`);
    }
  } else if (d.hotel && d.shuttle) {
    lines.push(`🏨 Hotel: ${d.hotel.name} (${d.hotel.zone}, ${d.hotel.tier})`);
    lines.push(`🚐 Shuttle: ${d.shuttle.zone} · departs ${d.shuttle.departure_time}`);
    lines.push(`🚪 Entry gate: ${d.entryGate?.name} · Exit gate: ${d.exitGate?.name}`);
    lines.push(`💳 10% off this hotel booking — code on your ticket page.`);
  }
  lines.push('');
  lines.push(`📺 10% off Airtel TV FIFA subscription: shown on your ticket page.`);
  lines.push(`🔗 Manage your plan: ${d.ticket.unique_ticket_id}`);
  return lines.join('\n');
}

export async function sendWhatsApp(d) {
  const message = buildMessage(d);
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const to = process.env.WHATSAPP_TO;

  if (token && phoneId && to) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${phoneId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to,
            type: 'text',
            text: { body: message },
          }),
        },
      );
      const data = await res.json();
      console.log(`[WhatsApp Cloud API] sent to ${to}:`, data.messages?.[0]?.id ?? data);
      return { delivered: true, mock: false, message };
    } catch (e) {
      console.error('[WhatsApp] Cloud API call failed, falling back to mock:', e.message);
    }
  }

  console.log(
    '\n──────────── [WhatsApp MOCK → ' +
      (to ?? '<sandbox number — set WHATSAPP_TOKEN/PHONE_ID/TO env vars>') +
      '] ────────────\n' +
      message +
      '\n──────────────────────────────────────────────────\n',
  );
  return { delivered: false, mock: true, message };
}