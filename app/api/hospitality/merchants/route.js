import { NextResponse } from 'next/server';
import { stadiaStore } from '@/lib/stadiaStore';

export async function GET() {
  return NextResponse.json(stadiaStore.merchants);
}
