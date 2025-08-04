
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

let tracks = [];

// Створюємо папки, якщо їх немає
const musicDir = path.join(__dirname, 'public/uploads/music');
const coverDir = path.join(__dirname, 'public/uploads/covers');
if (!fs.existsSync(musicDir)) fs.mkdirSync(musicDir, { recursive: true });
if (!fs.existsSync(coverDir)) fs.mkdirSync(coverDir, { recursive: true });

// Налаштування multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = file.fieldname === 'music' ? musicDir : coverDir;
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.get('/', (req, res) => {
  const q = req.query.q?.toLowerCase() || '';
  const results = tracks.filter(track =>
    track.title.toLowerCase().includes(q) || track.artist.toLowerCase().includes(q)
  );
  res.render('index', { tracks: results });
});

app.get('/upload', (req, res) => {
  res.render('upload');
});

app.post('/upload', upload.fields([{ name: 'music' }, { name: 'cover' }]), (req, res) => {
  try {
    const { title, artist } = req.body;
    const musicFile = req.files['music']?.[0];
    if (!musicFile) return res.status(400).send('No music file uploaded');

    const coverFile = req.files['cover']?.[0];
    const musicPath = '/public/uploads/music/' + musicFile.filename;
    const coverPath = coverFile ? '/public/uploads/covers/' + coverFile.filename : '';

    tracks.push({
      id: Date.now(),
      title,
      artist,
      music: musicPath,
      cover: coverPath,
      plays: 0,
    });
    res.redirect('/');
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).send('Upload failed');
  }
});

app.post('/play/:id', (req, res) => {
  const track = tracks.find(t => t.id == req.params.id);
  if (track) track.plays += 1;
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
