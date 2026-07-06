const crypto = require('crypto');

export default async function handler(req, res) {
    // Настройка CORS заголовков, чтобы Mini App мог свободно общаться с API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-TMA-Auth, Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const authData = req.headers['x-tma-auth'];
    if (!authData) return res.status(401).json({ error: 'Заголовок X-TMA-Auth пуст' });

    // Валидация Телеграм-сессии
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const isValid = verifyTelegramAuth(authData, botToken);

    if (!isValid) {
        return res.status(403).json({ error: 'Ошибка валидации Telegram данных' });
    }

    try {
        // Получаем сохраненную статистику Майнкрафта из Vercel KV
        const kvRes = await fetch(`${process.env.KV_REST_API_URL}/get/minecraft_stats`, {
            headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
        });
        const kvData = await kvRes.json();
        const minecraftStats = kvData.result ? JSON.parse(kvData.result) : { message: "Данных пока нет" };

        // Возвращаем игроку успешный статус и данные сервера
        return res.status(200).json({
            status: 'success',
            user: 'authorized',
            serverData: minecraftStats
        });
    } catch (error) {
        return res.status(500).json({ error: 'Ошибка чтения из базы данных KV' });
    }
}

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
