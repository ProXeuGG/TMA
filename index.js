const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Установка шаблонизатора EJS
app.set('view engine', 'ejs');

// Раздача статических файлов (CSS, изображения) из папки public
app.use(express.static('public'));

// Главная страница
app.get('/', (req, res) => {
    res.render('index', { title: 'K-TECHRP | Панель управления' });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
