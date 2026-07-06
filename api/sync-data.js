export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { secret, data } = req.body;

    if (!secret || secret !== process.env.MINECRAFT_SECRET_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid Secret Key' });
    }

    try {
        // Проверяем, что переменные базы вообще существуют
        if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
            return res.status(500).json({ error: 'Переменные KV базы данных не найдены. Сделай передеплой проекта!' });
        }

        // Самый надежный формат отправки в Redis (массивом команд)
        const kvRes = await fetch(process.env.KV_REST_API_URL, {
            method: 'POST',
            headers: { 
                Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(['SET', 'minecraft_stats', JSON.stringify(data)])
        });

        const kvResult = await kvRes.json();
        
        if (kvResult.error) {
            return res.status(500).json({ error: `Ошибка Redis: ${kvResult.error}` });
        }

        return res.status(200).json({ status: 'success', message: 'Данные успешно синхронизированы!' });
    } catch (error) {
        return res.status(500).json({ error: `Критический сбой KV: ${error.message}` });
    }
}
