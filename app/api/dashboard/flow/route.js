import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const time = Number(searchParams.get('time')) || 60;

  return NextResponse.json({
    timeMinute: time,
    ingressVelocity: Math.round(140 + Math.sin(time / 20) * 45),
    activeSpectators: Math.round(38214 * (time / 120)),
    mixingPoints: [
      {
        id: 'node-nerul-east',
        name: 'Nerul East Concourse · Pedestrian Crossing',
        lat: 19.0588,
        lng: 73.0084,
        collisionRisk: time > 45 ? 0.76 : 0.24,
        status: time > 45 ? 'HEAVY' : 'OPTIMAL',
        localVolume: 1420,
        outstationVolume: 890,
        recommendation: 'Divert 400 outstation fans to South Perimeter corridor via Gate D.',
      },
      {
        id: 'node-palm-beach',
        name: 'Palm Beach Road Junction · P4 Entry',
        lat: 19.0604,
        lng: 73.0055,
        collisionRisk: 0.32,
        status: 'OPTIMAL',
        localVolume: 840,
        outstationVolume: 310,
        recommendation: 'Maintain continuous VMS signage along Sector 14.',
      },
    ],
    corridors: [
      { id: 'corridor-local-1', name: 'Nerul Station West Spine', load: 0.74, side: 'local' },
      { id: 'corridor-outstation-1', name: 'Highway Express Shuttle Dedicated Lane', load: 0.61, side: 'outstation' },
    ],
  });
}
