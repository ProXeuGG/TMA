import { Redis } from '@upstash/redis';

// Инициализация Redis через переменные окружения Vercel
const redis = Redis.fromEnv();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Метод не поддерживается' });
    }

    const { secret, state } = req.body;

    // Проверка секретного ключа из config.yml плагина
    if (!secret || secret !== process.env.MINECRAFT_SECRET_KEY) {
        return res.status(401).json({ error: 'Неверный секретный ключ бэкенда!' });
    }

    try {
        // Сохраняем состояние сервера. Ставим TTL 15 секунд. 
        // Если сервер выключится, данные устареют и Mini App покажет "Оффлайн".
        await redis.set('mc_server_state', JSON.stringify(state), { ex: 15 });
        
        return res.status(200).json({ status: 'success' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
