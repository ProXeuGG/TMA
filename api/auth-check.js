const Redis = require('ioredis');
const crypto = require('crypto');

const redis = new Redis(process.env.REDIS_URL);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-TMA-Auth, Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const authData = req.headers['x-tma-auth'];
    if (!authData) return res.status(401).json({ error: 'Заголовок X-TMA-Auth пуст' });

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const isValid = verifyTelegramAuth(authData, botToken);

    if (!isValid) {
        return res.status(403).json({ error: 'Ошибка валидации Telegram данных' });
    }

    try {
        // Достаем данные из базы Redis
        const cachedData = await redis.get('minecraft_stats');
        const minecraftStats = cachedData ? JSON.parse(cachedData) : { message: "Данных пока нет" };

        return res.status(200).json({
            status: 'success',
            user: 'authorized',
            serverData: minecraftStats
        });
    } catch (error) {
        return res.status(500).json({ error: `Ошибка чтения Redis: ${error.message}` });
    }
};

function verifyTelegramAuth(authData, botToken) {
    try {
        const initData = new URLSearchParams(authData);
        const hash = initData.get('hash');
        initData.delete('hash');

        const dataCheckString = Array.from(initData.entries())
            .map(([key, value]) => `${key}=${value}`)
            .sort()
            .join('\n');

        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        return calculatedHash === hash;
    } catch (e) {
        return false;
    }
}
