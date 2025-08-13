const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Перевіряємо чи існує папка uploads
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Видаємо статичні файли з /public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // для роботи з JSON в DELETE запитах

// Налаштування зберігання файлів (у /public/uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if ((file.mimetype || '').startsWith('audio/')) cb(null, true);
    else cb(new Error('Файл має бути аудіо.'));
  }
});

// Завантаження треку
app.post('/upload', upload.single('track'), (req, res) => {
  if (!req.file) return res.status(400).send('Файл не отримано');
  res.redirect('/'); // Повертаємось на головну після завантаження
});

// Список треків (імена файлів)
app.get('/tracks', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) return res.json([]);
    const audioFiles = files
      .filter(f => /\.(mp3|wav|ogg)$/i.test(f))
      .sort((a, b) => {
        const aT = fs.statSync(path.join(uploadsDir, a)).mtimeMs;
        const bT = fs.statSync(path.join(uploadsDir, b)).mtimeMs;
        return bT - aT;
      });
    res.json(audioFiles);
  });
});

// Видалення треку
app.delete('/tracks/:name', (req, res) => {
  const trackName = req.params.name;
  const trackPath = path.join(uploadsDir, trackName);

  if (!fs.existsSync(trackPath)) {
    return res.status(404).send('Трек не знайдено');
  }

  fs.unlink(trackPath, err => {
    if (err) {
      console.error('Помилка при видаленні файлу:', err);
      return res.status(500).send('Не вдалося видалити трек');
    }
    res.status(200).send('Трек видалено');
  });
});

// Головна
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Старт
app.listen(PORT, () => {
  console.log(`Sweet running: http://localhost:${PORT}`);
});
