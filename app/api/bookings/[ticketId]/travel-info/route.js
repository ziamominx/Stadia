import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  try {
    const { ticketId } = await params;
    const body = await request.json();

    return NextResponse.json({
      success: true,
      ticketId,
      ...body,
      assignedGate: body.visitorType === 'local' ? 'Gate A · North' : 'Gate C · East',
      assignedParking: body.travelMode === 'vehicle' ? 'P4 · Palm Beach Road' : null,
      message: 'Travel logistics synchronized with Stadia Mesh.'
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update travel info' }, { status: 500 });
  }
}
