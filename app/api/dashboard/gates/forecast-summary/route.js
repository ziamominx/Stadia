import { NextResponse } from 'next/server';
import { GATES_DATA } from '../../../../../lib/stadiaData';

export async function GET() {
  const summary = GATES_DATA.map((gate) => ({
    id: gate.id,
    name: gate.name,
    capacity: gate.capacity,
    assigned: gate.assigned,
    side: gate.side,
    load: gate.load,
    status: gate.status,
    forecast_peak_time: '19:45',
    forecast_egress_rate_per_min: Math.round(gate.capacity / 25),
  }));

  return NextResponse.json({
    gates: summary,
    total_assigned: GATES_DATA.reduce((acc, g) => acc + g.assigned, 0),
    total_capacity: GATES_DATA.reduce((acc, g) => acc + g.capacity, 0),
    system_status: 'HEALTHY'
  });
}
