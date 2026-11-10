import { NextResponse } from 'next/server';
import { stadiaStore } from '../../../../../lib/stadiaStore';

export async function POST(request, { params }) {
  try {
    const { ticketId } = await params;
    const body = await request.json();

    const booking = stadiaStore.updateTravelInfo(ticketId, {
      visitorType: body.visitorType,
      travelMode: body.travelMode,
    });

    return NextResponse.json({
      success: true,
      ticketId,
      ...body,
      booking,
      assignedGate: body.visitorType === 'local' ? 'Gate A · North Concourse' : 'Gate C · East Concourse',
      assignedParking: body.travelMode === 'vehicle' ? 'P1 · Nerul West Grounds' : null,
      message: 'Travel logistics synchronized with Stadia Mesh.',
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update travel info' }, { status: 500 });
  }
}
