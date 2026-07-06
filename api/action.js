const http = require('http');

// НАСТРОЙКА СВЯЗИ С ИГРОВЫМ СЕРВЕРОМ
const MC_IP = "твой_ip_на_hosting_minecraft_pro"; 
const MC_PORT = 25600; // Твой открытый доп. порт
const SECRET_KEY = "050282007s"; // Ключ из config.yml

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(450).send('Method Not Allowed');

    const { actionData } = req.body || {}; // Получаем экшен от фронтенда
    
    // 1. Здесь ты можешь делать любые манипуляции со СВОЕЙ базой данных
    // Например: await myDatabase.logAction(actionData);

    // 2. Мгновенно отправляем этот экшен напрямую в твой Майнкрафт плагин
    const postData = JSON.stringify({
        secret: SECRET_KEY,
        action: actionData
    });

    const options = {
        hostname: MC_IP,
        port: MC_PORT,
        path: '/action',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 2000 // Если сервер лежит, не ждем долго
    };

    const mcReq = http.request(options, (mcRes) => {
        let responseBody = '';
        mcReq.on('data', chunk => responseBody += chunk);
        mcReq.on('end', () => {
            res.status(200).json({ status: 'success', serverResponse: responseBody });
        });
    });

    mcReq.on('error', (e) => {
        res.status(500).json({ status: 'error', message: 'Майнкрафт сервер недоступен' });
    });

    mcReq.write(postData);
    mcReq.end();
};
