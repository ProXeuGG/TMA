import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Метод запрещен' });

    const { secret } = req.body;

    // Проверяем секретный ключ
    if (!secret || secret !== process.env.MINECRAFT_SECRET_KEY) {
        return res.status(401).json({ error: 'Неверный секретный ключ' });
    }

    try {
        // Забираем (вырезаем) первую команду из очереди в Redis
        const actionData = await redis.lpop('mc_action_queue');

        if (actionData) {
            // Если команда есть, отдаем её плагину Майнкрафта
            return res.status(200).json({ status: 'success', actionData });
        }

        // Если кнопок никто не нажимал, говорим плагину "команд нет"
        return res.status(200).json({ status: 'no_actions' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
