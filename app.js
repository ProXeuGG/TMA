// Инициализируем Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand(); // Разворачиваем на всю высоту

const authStatusDiv = document.getElementById('auth-status');
const contentDiv = document.getElementById('content');

// Проверяем, что запущено внутри Telegram
if (!tg.initData) {
    authStatusDiv.innerHTML = "<p style='color:red;'>Открыть можно только через Telegram Mini App!</p>";
} else {
    // Отправляем данные авторизации на наш Bukkit-сервер
    fetch('/api/auth-check', {
        method: 'POST',
        headers: {
            'X-TMA-Auth': tg.initData
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            authStatusDiv.innerHTML = `<p style='color:green;'>Успешно авторизован как: ${tg.initDataUnsafe.user.username}</p>`;
            contentDiv.style.display = 'block';
        } else {
            authStatusDiv.innerHTML = `<p style='color:red;'>Ошибка авторизации: ${data.message}</p>`;
        }
    })
    .catch(err => {
        authStatusDiv.innerHTML = "<p style='color:red;'>Не удалось связаться с сервером Майнкрафта</p>";
        console.error(err);
    });
}