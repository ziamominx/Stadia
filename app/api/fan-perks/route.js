import { NextResponse } from 'next/server';
import { stadiaStore } from '@/lib/stadiaStore';

// This public route exposes only the reference details needed by the fan page.
// Operational inventory, capacity, rates, and simulation state stay on staff routes.
export async function GET() {
  const offers = stadiaStore.merchants.map((merchant) => ({
    id: merchant.id,
    name: merchant.name,
    zone: merchant.zone,
    category: merchant.category,
    description: merchant.description,
    discountPct: merchant.discount_pct,
    code: merchant.voucher_code,
  }));

  const areas = stadiaStore.zones.map((zone) => ({
    id: zone.id,
    name: zone.name,
    transit: zone.transit_link_desc,
  }));

  return NextResponse.json({ offers, areas }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
