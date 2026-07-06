import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Проверяем секретный ключ авторизации из config.yml плагина
    if (body.secret !== process.env.MINECRAFT_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Сохраняем стейт в Redis на 15 секунд (если сервер выключится, данные устареют)
    await kv.set('mc_server_state', body.state, { ex: 15 });
    return NextResponse.json({ status: 'success' });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
