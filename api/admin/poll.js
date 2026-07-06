const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { secret } = req.body;

    // Проверяем секретный ключ плагина
    if (!secret || secret !== process.env.MINECRAFT_SECRET_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid Secret Key' });
    }

    const startTime = Date.now();
    const timeout = 8000; // 8 секунд удерживаем запрос (чтобы Vercel не ругался на таймаут)

    try {
        // Запускаем цикл ожидания команды
        while (Date.now() - startTime < timeout) {
            // Пытаемся забрать команду из Redis
            const cmd = await redis.rpop('minecraft_cmd_queue');
            
            if (cmd) {
                // Если команда есть — мгновенно возвращаем её серверу
                return res.status(200).json({
                    status: 'success',
                    command: JSON.parse(cmd)
                });
            }

            // Если команды нет — спим 500 миллисекунд и проверяем снова
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Если за 8 секунд ничего не пришло, мягко завершаем запрос, чтобы плагин открыл новый
        return res.status(200).json({ status: 'timeout' });

    } catch (error) {
        return res.status(500).json({ error: `Ошибка лонг-поллинга: ${error.message}` });
    }
};
