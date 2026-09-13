// Comprehensive End-to-End Verification of all API Endpoints & Routes
const BASE = 'http://localhost:3000';

async function testRoute(name, url, options = {}) {
  try {
    const res = await fetch(`${BASE}${url}`, options);
    const contentType = res.headers.get('content-type') || '';
    let body = null;
    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }
    const ok = res.status >= 200 && res.status < 400;
    console.log(`${ok ? '✓ PASS' : '✗ FAIL'} [${res.status}] ${name} -> ${url}`);
    if (!ok) {
      console.error('   Error response:', body);
    }
    return { ok, status: res.status, body };
  } catch (err) {
    console.error(`✗ ERROR ${name} -> ${url}:`, err.message);
    return { ok: false, error: err.message };
  }
}

async function run() {
  console.log('\n--- 1. TESTING ALL API ROUTES ---');
  await testRoute('Matches', '/api/matches');
  await testRoute('Match 1 Seats', '/api/matches/1/seats');
  
  const bookingRes = await testRoute('Create Booking', '/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchId: 1, seatBlockId: 1, seatNumber: 'C12', user: { name: 'Test Fan', phone: '+919999999999' } })
  });

  const testTicketId = bookingRes.body?.ticketId || 'FWC-IND-10492';
  await testRoute('Get Ticket', `/api/bookings/${testTicketId}`);
  
  await testRoute('Travel Info', `/api/bookings/${testTicketId}/travel-info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ visitorType: 'local', travelMode: 'transit' })
  });

  await testRoute('Select Hotel', `/api/bookings/${testTicketId}/hotel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hotelId: 1 })
  });

  await testRoute('Verify Updated Ticket', `/api/bookings/${testTicketId}`);

  await testRoute('Claim Referral', '/api/referrals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticketId: testTicketId, type: 'hotel' })
  });

  await testRoute('Referrals Summary', '/api/referrals/summary');
  
  await testRoute('Send WhatsApp', `/api/notifications/whatsapp/${testTicketId}`, {
    method: 'POST'
  });

  await testRoute('Dashboard Overview', '/api/dashboard/overview');
  await testRoute('Dashboard Gates', '/api/dashboard/gates');
  await testRoute('Gate 1 Forecast', '/api/dashboard/gates/1/forecast');
  await testRoute('Gate Forecast Summary', '/api/dashboard/gates/forecast-summary');
  await testRoute('Crowd Flow', '/api/dashboard/flow?time=45');
  await testRoute('Parking', '/api/dashboard/parking');
  await testRoute('Shuttles', '/api/dashboard/shuttles');
  await testRoute('Revenue', '/api/dashboard/revenue');
  await testRoute('Hotels', '/api/hotels');
  await testRoute('Tourism', '/api/tourism');
  await testRoute('Hospitality Zones', '/api/hospitality/zones');
  await testRoute('Hospitality Merchants', '/api/hospitality/merchants');
  await testRoute('Itinerary Events', '/api/itinerary/events');
  
  await testRoute('Plan Itinerary', '/api/itinerary/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId: 'fifa-wwc-2026-final', attendeeType: 'local' })
  });

  await testRoute('Orchestration Ecosystem', '/api/orchestration/ecosystem');
  await testRoute('Orchestration Scenarios', '/api/orchestration/scenarios');
  
  await testRoute('Trigger Scenario', '/api/orchestration/scenarios/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioId: 'demand_spike' })
  });

  await testRoute('Apply Intervention', '/api/orchestration/interventions/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Gate B → Gate A Diversion',
      actionType: 'reroute_gate_b_to_a',
      impactMetric: '-23% Peak Load',
      description: 'Redirect 1,200 attendees'
    })
  });

  await testRoute('Reset Orchestration', '/api/orchestration/reset', {
    method: 'POST'
  });

  console.log('\n--- 2. TESTING ALL FRONTEND PAGES ---');
  const pages = [
    '/',
    '/matches',
    '/match/1',
    '/checkout/1/1/C12',
    `/ticket/${testTicketId}`,
    `/ticket/${testTicketId}/confirmation`,
    '/command-center',
    '/simulator',
    '/organizer',
    '/organizer/gates',
    '/organizer/shuttles',
    '/crowd-flow',
    '/journey-planner',
    '/hospitality-hub',
    '/tourism'
  ];

  for (const page of pages) {
    await testRoute(`Page ${page}`, page);
  }

  console.log('\n--- ALL CHECKS COMPLETED ---');
}

run();
