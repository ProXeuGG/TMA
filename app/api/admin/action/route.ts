import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { actionData } = await req.json();
    if (!actionData) return NextResponse.json({ error: 'Bad Request' }, { status: 400 });

    // Добавляем команду в конец очереди Redis
    await kv.rpush('mc_action_queue', actionData);
    return NextResponse.json({ status: 'queued' });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
