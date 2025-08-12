const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.use(express.static(path.join(__dirname, 'public')));

app.post('/upload', upload.single('track'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ message: 'File uploaded', filename: req.file.filename });
});

app.get('/tracks', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Unable to read files' });
    res.json(files);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});