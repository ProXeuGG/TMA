const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { secret, data } = req.body;

    if (!secret || secret !== process.env.MINECRAFT_SECRET_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid Secret Key' });
    }

    try {
        // Просто обновляем онлайн в Redis раз в 2 минуты
        await redis.set('minecraft_stats', JSON.stringify(data));
        return res.status(200).json({ status: 'success', message: 'Данные успешно синхронизированы!' });
    } catch (error) {
        return res.status(500).json({ error: `Ошибка базы Redis: ${error.message}` });
    }
};
