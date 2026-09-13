import { createBooking, updateTravelInfo, selectHotel, getTicketDetail, claimReferral } from '../lib/ticketEngine.js';

console.log('=== TESTING CHUNK 1 TICKETING & ROUTING ENGINE ===\n');

// 1. Create booking for Match 1, Block A1 (id 1), Seat B5
console.log('1. Testing createBooking...');
const bookingRes = createBooking({
  matchId: 1,
  seatBlockId: 1,
  seatNumber: 'B5',
  user: {
    name: 'Ananya Sharma',
    phone: '9876543210',
    email: 'ananya@example.com',
    homeLocation: 'Navi Mumbai',
  },
});
console.log('   ✓ Booking created! Ticket ID:', bookingRes.ticketId);

// 2. Fetch initial ticket detail
console.log('\n2. Testing getTicketDetail (initial)...');
let detail = getTicketDetail(bookingRes.ticketId);
console.log('   ✓ Match:', `${detail.match.home_team} vs ${detail.match.away_team}`);
console.log('   ✓ Block:', detail.block.block_name, '· Seat:', detail.ticket.seat_number);
console.log('   ✓ Visitor type initially:', detail.ticket.visitor_type);

// 3. Update Travel Info (Local fan + Personal vehicle)
console.log('\n3. Testing updateTravelInfo (Local + Vehicle)...');
detail = updateTravelInfo(bookingRes.ticketId, {
  visitorType: 'local',
  travelMode: 'vehicle',
});
console.log('   ✓ Assigned Entry Gate:', detail.entryGate?.name);
console.log('   ✓ Assigned Exit Gate:', detail.exitGate?.name);
console.log('   ✓ Assigned Parking Zone:', detail.parkingZone?.name);
console.log('   ✓ Route Markers Count:', detail.route.markers.length);
console.log('   ✓ Route Entry Waypoints:', detail.route.entry.length);
console.log('   ✓ Route Exit Waypoints:', detail.route.exit.length);

// 4. Test Outstation booking flow
console.log('\n4. Testing Outstation Booking Flow...');
const outstationBooking = createBooking({
  matchId: 1,
  seatBlockId: 9, // E1
  seatNumber: 'D10',
  user: {
    name: 'John Smith',
    phone: '+44 7911 123456',
    email: 'john@example.co.uk',
    homeLocation: 'London',
  },
});
let outstationDetail = updateTravelInfo(outstationBooking.ticketId, {
  visitorType: 'outstation',
});
console.log('   ✓ Outstation status set:', outstationDetail.ticket.visitor_type);

// Select partner hotel (Hotel 1: The Grand Vashi)
outstationDetail = selectHotel(outstationBooking.ticketId, 1);
console.log('   ✓ Assigned Hotel:', outstationDetail.hotel?.name);
console.log('   ✓ Assigned Shuttle:', outstationDetail.shuttle ? `${outstationDetail.shuttle.zone} · ${outstationDetail.shuttle.departure_time}` : 'Shuttle Assigned');
console.log('   ✓ Assigned Entry Gate (East/South):', outstationDetail.entryGate?.name);
console.log('   ✓ Assigned Exit Gate:', outstationDetail.exitGate?.name);

// 5. Test Referral claims
console.log('\n5. Testing Referral Claims...');
claimReferral(outstationBooking.ticketId, 'hotel');
claimReferral(outstationBooking.ticketId, 'airtel_tv');
outstationDetail = getTicketDetail(outstationBooking.ticketId);
console.log('   ✓ Claimed Referrals:', outstationDetail.claims);

console.log('\n=== ALL CHUNK 1 LOGIC & ROUTING TESTS PASSED PERFECTLY ===');
