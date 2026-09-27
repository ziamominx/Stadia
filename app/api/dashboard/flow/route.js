import { NextResponse } from 'next/server';
import { GATES_DATA, MATCHES_DATA } from '@/lib/stadiaData';
import { STADIUM_GATES, STADIUM_PARKING, STADIUM_SHUTTLES, STADIUM_TRANSIT } from '@/lib/operations/dy-patil.mjs';

// Deterministic preview flow on the DY Patil reference geometry.
// This is a scenario curve, not a live count of people on each path.
export async function GET(request) {
  const raw = Number(new URL(request.url).searchParams.get('time'));
  const time = Number.isFinite(raw) ? Math.max(0, Math.min(180, raw)) : 60;
  const progress = time / 180;
  const intensity = Math.max(.05, Math.sin(Math.PI * progress));
  const gate = (letter) => STADIUM_GATES.find((item) => item.id === letter);
  const routes = [
    ...[
      [STADIUM_PARKING[0], gate('A')],
      [STADIUM_PARKING[1], gate('B')],
      [STADIUM_PARKING[2], gate('G')],
      [STADIUM_PARKING[3], gate('H')],
      [STADIUM_PARKING[4], gate('A')],
    ].map(([from, to], index) => ({ id: `parking-${from.id}`, name: `${from.id} ${from.name} → Gate ${to.id}`, side: 'local', from: [from.lat, from.lng], to: [to.lat, to.lng], routed: 300 + index * 80 })),
    ...STADIUM_TRANSIT.map((route, index) => ({ id: `transit-${index}`, name: route.name, side: 'local', from: route.points[0], to: route.points.at(-1), routed: 450 + index * 170 })),
    ...STADIUM_SHUTTLES.map((route, index) => ({ id: `shuttle-${index}`, name: route.name, side: 'outstation', from: route.points[0], to: route.points.at(-1), routed: 390 + index * 130 })),
  ];
  const segments = routes.map((route) => ({ ...route, density: Math.round(route.routed * intensity) }));
  const mixingPoints = time >= 75 && time <= 150 ? [{
    id: 'north-east-approach',
    name: 'North-East corridor crossing',
    lat: 19.04316,
    lng: 73.02805,
    note: 'Scenario hotspot where local and outstation approaches could converge. Verify on site before intervening.',
    distanceM: 180,
  }] : [];
  return NextResponse.json({
    source: 'simulated',
    match: { home_team: MATCHES_DATA[0]?.home_team || 'India', away_team: MATCHES_DATA[0]?.away_team || 'Australia' },
    timeMinute: time,
    ingressVelocity: Math.round(45 + intensity * 140),
    activeSpectators: Math.round(GATES_DATA.reduce((sum, item) => sum + item.assigned, 0) * progress),
    segments,
    mixingPoints,
  });
}
