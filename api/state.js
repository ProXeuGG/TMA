// Подключи сюда свою базу данных, которая у тебя уже настроена

module.exports = async (req, res) => {
    // Если плагин прислал новые данные о сервере — сохраняем их в БД
    if (req.method === 'POST') {
        const { secret, state } = req.body;
        if (secret !== "050282007s") return res.status(401).send('Unauthorized');
        
        // Твой код: сохраняешь объект state в свою БД
        // await myDB.set('mc_status', state);
        
        return res.status(200).json({ status: 'updated' });
    }

    // Если фронтенд запрашивает данные — берем их из твоей БД и отдаем на сайт
    if (req.method === 'GET') {
        // Твой код: достаешь данные из своей БД
        // const currentState = await myDB.get('mc_status');
        
        // Временный заглушка-ответ, пока не подставишь свою БД:
        const currentState = { stats: { tps: 20.0, onlineCount: 5, maxPlayers: 100, serverIp: 'K-TECHRP' }, players: [] };
        
        return res.status(200).json(currentState);
    }
};
