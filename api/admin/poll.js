const Redis = require('ioredis');

module.exports = async (req, res) => {
    // 1. Сразу отсекаем неверные методы. GET больше не вызовет падение!
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Проверяем наличие критически важных переменных в Vercel
    if (!process.env.REDIS_URL) {
        return res.status(500).json({ 
            error: 'Ошибка конфигурации Vercel', 
            details: 'Переменная окружения REDIS_URL отсутствует в настройках проекта!' 
        });
    }
    if (!process.env.MINECRAFT_SECRET_KEY) {
        return res.status(500).json({ 
            error: 'Ошибка конфигурации Vercel', 
            details: 'Переменная окружения MINECRAFT_SECRET_KEY отсутствует в настройках проекта!' 
        });
    }

    const { secret } = req.body || {};

    // 3. Проверяем секретный ключ плагина
    if (!secret || secret !== process.env.MINECRAFT_SECRET_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid Secret Key' });
    }

    let redis;

    try {
        // 4. Безопасно инициализируем Redis прямо внутри try-catch
        redis = new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: 0,
            connectTimeout: 3000 // Ждем подключения не более 3 секунд
        });

        // Перехватываем внутренние ошибки коннекта
        redis.on('error', (err) => {
            console.error('Redis internal error:', err.message);
        });

        // 5. Пытаемся забрать команду
        const cmd = await redis.rpop('minecraft_cmd_queue');
        
        // Корректно закрываем соединение, чтобы не плодить утечки в Serverless
        await redis.quit();

        if (cmd) {
            return res.status(200).json({
                status: 'success',
                actionData: cmd
            });
        }

        return res.status(200).json({ status: 'empty' });

    } catch (error) {
        // Если что-то пошло не так, принудительно тушим коннект, если он успел создаться
        if (redis) {
            try { redis.disconnect(); } catch (e) {}
        }

        // Возвращаем детальную ошибку текстом в JSON, а не ломаем функцию
        return res.status(500).json({ 
            error: 'Критическая ошибка выполнения функции', 
            message: error.message,
            stack: error.stack
        });
    }
};
