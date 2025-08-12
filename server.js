const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(__dirname));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

app.post('/upload', upload.single('track'), (req, res) => {
    res.sendStatus(200);
});

app.get('/tracks', (req, res) => {
    fs.readdir('uploads', (err, files) => {
        if (err) return res.status(500).json([]);
        res.json(files);
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));