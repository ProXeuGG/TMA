import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Метод запрещен' });

    const { initData, actionData } = req.body;

    if (!initData || !actionData) {
        return res.status(400).json({ error: 'Нет данных' });
    }

    try {
        // Заталкиваем команду в очередь Redis. Майнкрафт заберет её через poll.js
        await redis.rpush('mc_action_queue', actionData);
        return res.status(200).json({ status: 'queued' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
