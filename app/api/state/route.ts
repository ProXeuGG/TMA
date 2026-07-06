import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function GET() {
  const state = await kv.get('mc_server_state');
  if (!state) return NextResponse.json({ online: false });
  return NextResponse.json({ online: true, ...state });
}
