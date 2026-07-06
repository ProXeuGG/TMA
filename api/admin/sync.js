import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Метод запрещен' });

    const { secret, state } = req.body;

    // Проверяем секретный ключ (защита от хакеров)
    if (!secret || secret !== process.env.MINECRAFT_SECRET_KEY) {
        return res.status(401).json({ error: 'Неверный секретный ключ' });
    }

    try {
        // Записываем данные сервера в базу данных Redis на 15 секунд
        await redis.set('mc_server_state', JSON.stringify(state), { ex: 15 });
        return res.status(200).json({ status: 'success' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
