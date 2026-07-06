import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.secret !== process.env.MINECRAFT_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Извлекаем самую старую команду из списка очереди команд
    const actionData = await kv.lpop('mc_action_queue');
    
    if (actionData) {
      return NextResponse.json({ status: 'success', actionData });
    }
    return NextResponse.json({ status: 'no_actions' });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
