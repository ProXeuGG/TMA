const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

module.exports = async (req, res) => {
    // Разрешаем только POST запросы от плагина
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { secret } = req.body;

    // Проверяем секретный ключ плагина
    if (!secret || secret !== process.env.MINECRAFT_SECRET_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid Secret Key' });
    }

    try {
        // Забираем команду из Redis ровно ОДИН раз (без циклов и setTimeout)
        const cmd = await redis.rpop('minecraft_cmd_queue');
        
        if (cmd) {
            // Если в Redis лежал чистый текст (например, "act:gm1:Player"), 
            // отдаем его в ключе actionData, который ждет наш Minecraft-плагин
            return res.status(200).json({
                status: 'success',
                actionData: cmd
            });
        }

        // Если очереди нет — мгновенно закрываем запрос. Никаких зависаний и 502 ошибок!
        return res.status(200).json({ status: 'empty' });

    } catch (error) {
        return res.status(500).json({ error: `Ошибка базы данных Redis: ${error.message}` });
    }
};
