export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { secret, data } = req.body;

    // Проверяем, что запрос пришел именно от нашего плагина
    if (!secret || secret !== process.env.MINECRAFT_SECRET_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid Secret Key' });
    }

    try {
        // Сохраняем данные Майнкрафта в базу данных Vercel KV без сторонних библиотек
        await fetch(`${process.env.KV_REST_API_URL}/set/minecraft_stats`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
            body: JSON.stringify(data)
        });

        return res.status(200).json({ status: 'success', message: 'Данные успешно синхронизированы!' });
    } catch (error) {
        return res.status(500).json({ error: 'Ошибка записи в базу данных KV' });
    }
}
