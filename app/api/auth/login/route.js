import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    if (username === 'organizer' && password === 'stadia2026') {
      return NextResponse.json({
        ok: true,
        token: 'stadia_organizer_jwt_token_demo',
        user: { name: 'FIFA Operations Command', role: 'organizer', clearance: 'LEVEL_4' },
      });
    }
    return NextResponse.json({ ok: false, error: 'Invalid organizer credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
