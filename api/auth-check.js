const crypto = require('crypto');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { initData } = req.body || {};
    if (!initData) return res.status(400).json({ authorized: false, error: 'Missing initData' });

    try {
        // 1. Проверяем валидность данных через подпись бота
        const params = new URLSearchParams(initData);
        const hash = params.get('hash');
        params.delete('hash');

        const dataCheckString = Array.from(params.entries())
            .map(([key, value]) => `${key}=${value}`)
            .sort()
            .join('\n');

        const secretKey = crypto.createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN).digest();
        const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        if (calculatedHash !== hash) {
            return res.status(401).json({ authorized: false, error: 'Invalid digital signature' });
        }

        // 2. Достаем ID пользователя
        const user = JSON.parse(params.get('user'));
        const userId = user.id.toString();

        // 3. Проверяем, есть ли этот ID в списке разрешенных админов Vercel
        const allowedIds = (process.env.ALLOWED_ADMIN_IDS || '').split(',');
        if (!allowedIds.includes(userId)) {
            return res.status(403).json({ authorized: false, error: 'Доступ запрещен: Вас нет в списке админов!' });
        }

        return res.status(200).json({ authorized: true, user });
    } catch (error) {
        return res.status(500).json({ authorized: false, error: error.message });
    }
};
