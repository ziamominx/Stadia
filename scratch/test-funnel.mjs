async function test() {
  const base = 'http://localhost:3000';

  console.log('--- Testing API endpoints ---');
  // 1. Matches
  const matchesRes = await fetch(`${base}/api/matches`);
  console.log(`GET /api/matches: status ${matchesRes.status}`);
  const matches = await matchesRes.json();
  const matchId = matches.matches?.[0]?.id || matches[0]?.id || 1;
  console.log(`Using matchId: ${matchId}`);

  // 2. Seats
  const seatsRes = await fetch(`${base}/api/matches/${matchId}/seats`);
  console.log(`GET /api/matches/${matchId}/seats: status ${seatsRes.status}`);
  const seatsData = await seatsRes.json();
  const block = seatsData.blocks?.[0] || seatsData.categories?.[0] || {};
  const blockId = block.id || block.blockId || 'North-Lower-A';
  const seatId = block.availableSeats?.[0] || block.seats?.[0]?.id || 'A-1';
  console.log(`Using blockId: ${blockId}, seat: ${seatId}`);

  // 3. Create Booking
  const bookingPayload = {
    matchId: Number(matchId),
    seatBlockId: Number(blockId),
    seatNumber: seatId,
    user: {
      name: 'Test Fan',
      phone: '9876543210',
      email: 'testfan@example.com',
      homeLocation: 'Mumbai'
    }
  };
  const bookRes = await fetch(`${base}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingPayload)
  });
  console.log(`POST /api/bookings: status ${bookRes.status}`);
  const bookingResult = await bookRes.json();
  console.log('Booking Result:', bookingResult);
  const ticketId = bookingResult.booking?.ticketId || bookingResult.ticketId || bookingResult.id;
  console.log(`Created ticketId: ${ticketId}`);

  // 4. Retrieve Booking
  if (ticketId) {
    const getBookRes = await fetch(`${base}/api/bookings/${ticketId}`);
    console.log(`GET /api/bookings/${ticketId}: status ${getBookRes.status}`);
    const bookDetail = await getBookRes.json();
    console.log(`Booking retrieved: ${!!bookDetail.ticketId || !!bookDetail.booking}`);
  }

  // 5. Test Key Pages
  console.log('\n--- Testing UI routes ---');
  const routes = [
    '/',
    '/matches',
    `/match/${matchId}`,
    `/checkout/${matchId}/B-101/A-12`,
    ticketId ? `/ticket/${ticketId}` : null,
    '/crowd-flow',
    '/journey-planner',
    '/hospitality-hub',
    '/command-center',
    '/simulator',
    '/tourism',
    '/admin'
  ].filter(Boolean);

  for (const route of routes) {
    const res = await fetch(`${base}${route}`);
    console.log(`GET ${route}: status ${res.status}`);
  }

  console.log('\nAll tests completed!');
}

test().catch(console.error);
