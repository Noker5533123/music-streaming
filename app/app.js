// app.js
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/songs', (req, res) => {
    const musicDir = path.join(__dirname, 'music');
    const files = fs.readdirSync(musicDir).filter(file => file.endsWith('.mp3'));

    const songs = files.map(file => ({
        name: file,
        url: `/music/${file}`
    }));

    res.json(songs);
});

app.get('/music/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'music', req.params.filename);
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunkSize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'audio/mpeg',
        };

        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'audio/mpeg',
        };

        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
    }
});

app.listen(port, () => {
    console.log(`Music streaming app listening at http://localhost:${port}`);
});

