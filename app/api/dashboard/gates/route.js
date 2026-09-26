import { NextResponse } from 'next/server';
import { GATES_DATA } from '@/lib/stadiaData';

export async function GET() {
  return NextResponse.json(GATES_DATA);
}
