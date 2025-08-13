const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Видаємо статичні файли з /public
app.use(express.static(path.join(__dirname, 'public')));

// Налаштування зберігання файлів (у /public/uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'public', 'uploads')),
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
  res.status(200).send('OK');
});

// Список треків (імена файлів)
app.get('/tracks', (req, res) => {
  const dir = path.join(__dirname, 'public', 'uploads');
  fs.readdir(dir, (err, files) => {
    if (err) return res.json([]);
    // Повертаємо за часом додавання (нові зверху)
    files.sort((a, b) => {
      const aT = fs.statSync(path.join(dir, a)).mtimeMs;
      const bT = fs.statSync(path.join(dir, b)).mtimeMs;
      return bT - aT;
    });
    res.json(files);
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