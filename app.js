const tg = window.Telegram.WebApp;
const statusDiv = document.getElementById('status');

try {
    tg.ready();
    
    if (!tg.initData) {
        statusDiv.innerText = "Открыть можно только через Telegram!";
    } else {
        statusDiv.innerText = "Отправка запроса на бэкэнд Майнкрафта...";
        
        fetch('/api/auth-check', {
            method: 'POST',
            headers: {
                'X-TMA-Auth': tg.initData,
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            statusDiv.innerText = `Получен ответ от Vercel. Статус: ${res.status}`;
            if (!res.ok) {
                throw new Error(`Vercel вернул ошибку ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            if (data.status === 'success') {
                statusDiv.innerText = `Привет, ${tg.initDataUnsafe.user.username}! Успешный вход.`;
            } else {
                statusDiv.innerText = `Сервер отклонил вход: ${data.message}`;
            }
        })
        .catch(err => {
            statusDiv.innerText = `Ошибка: ${err.message}. Проверь, запущен ли плагин и открыт ли порт!`;
        });
    }
} catch (e) {
    statusDiv.innerText = `Критический сбой скрипта: ${e.message}`;
}
