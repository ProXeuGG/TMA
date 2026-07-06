const Redis = require('ioredis');
const crypto = require('crypto');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { initData, action } = req.body || {};

    try {
        // Защита: Проверяем, что команду шлет именно админ
        const params = new URLSearchParams(initData);
        const hash = params.get('hash');
        params.delete('hash');
        const dataCheckString = Array.from(params.entries()).map(([k, v]) => `${k}=${v}`).sort().join('\n');
        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN).digest();
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
        
        if (calculatedHash !== hash) return res.status(401).json({ error: 'Unauthorized' });

        const user = JSON.parse(params.get('user'));
        const allowedIds = (process.env.ALLOWED_ADMIN_IDS || '').split(',');
        if (!allowedIds.includes(user.id.toString())) return res.status(403).json({ error: 'Forbidden' });

        // Отправляем команду в очередь Redis
        const redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 0, connectTimeout: 3000 });
        await redis.lpush('minecraft_cmd_queue', action);
        await redis.quit();

        return res.status(200).json({ status: 'success' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
