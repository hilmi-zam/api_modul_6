const express = require('express');
const app = express();
const PORT = 3100;

app.use(express.json());

let movieList = [
    {movieId: 1, title: 'Inception', director: 'Christopher Nolan', release: 2010},
    {movieId: 2, title: 'The Matrix', director: 'The Wachowskis', release: 1999},
    {movieId: 3, title: 'Interstellar', director: 'Christopher Nolan', release: 2014},
];

let directorList = [
    {directorId: 1, fullname: 'Christopher Nolan', birthYear: 1970},
    {directorId: 2, fullname: 'The Wachowskis', birthYear: 1965}
];

// Home endpoint
app.get('/home', (req, res) => {
    res.send('Selamat datang di layanan data movie!');
});

app.get('/', (req, res) => {
    res.send('Selamat datang di API Zami! Gunakan endpoint /home, /movies, atau /directors.');
});

// Ambil semua movie
app.get('/movies', (req, res) => {
    res.json(movieList);
});

// Cari movie berdasarkan id
app.get('/movies/id/:movieId', (req, res) => {
    const id = Number(req.params.movieId);
    const found = movieList.find(m => m.movieId === id);
    if (!found) {
        return res.status(404).send('Movie tidak ditemukan!');
    }
    res.json(found);
});

// Cari movie berdasarkan title
app.get('/movies/title/:title', (req, res) => {
    const searchTitle = req.params.title.toLowerCase();
    const result = movieList.find(m => m.title.toLowerCase() === searchTitle);
    if (!result) {
        return res.status(404).send('Movie dengan title tersebut tidak ada.');
    }
    res.json(result);
});

// Cari movie berdasarkan director
app.get('/movies/director/:director', (req, res) => {
    const searchDirector = req.params.director.toLowerCase();
    const result = movieList.filter(m => m.director.toLowerCase() === searchDirector);
    if (result.length === 0) {
        return res.status(404).send('Movie dengan director tersebut tidak ditemukan.');
    }
    res.json(result);
});

// Tambah movie
app.post('/movies', (req, res) => {
    const { title, director, release } = req.body;
    if (!title || !director || !release) {
        return res.status(400).send('Semua field (title, director, release) wajib diisi.');
    }
    const newMovie = {
        movieId: Date.now(),
        title,
        director,
        release: Number(release)
    };
    movieList.push(newMovie);
    res.status(201).json(newMovie);
});

// Hapus movie
app.delete('/movies/id/:movieId', (req, res) => {
    const id = Number(req.params.movieId);
    const idx = movieList.findIndex(m => m.movieId === id);
    if (idx === -1) {
        return res.status(404).send('Movie tidak ditemukan!');
    }
    const removed = movieList.splice(idx, 1);
    res.json(removed[0]);
});

// CRUD director

// Ambil semua director
app.get('/directors', (req, res) => {
    res.json(directorList);
});

// Ambil director berdasarkan id
app.get('/directors/id/:directorId', (req, res) => {
    const id = Number(req.params.directorId);
    const found = directorList.find(d => d.directorId === id);
    if (!found) {
        return res.status(404).send('Director tidak ditemukan!');
    }
    res.json(found);
});

// Tambah director
app.post('/directors', (req, res) => {
    const { fullname, birthYear } = req.body;
    if (!fullname || !birthYear) {
        return res.status(400).send('Field fullname dan birthYear wajib diisi.');
    }
    const newDirector = { directorId: Date.now(), fullname, birthYear: Number(birthYear) };
    directorList.push(newDirector);
    res.status(201).json(newDirector);
});

// Update director
app.put('/directors/id/:directorId', (req, res) => {
    const id = Number(req.params.directorId);
    const director = directorList.find(d => d.directorId === id);
    if (!director) {
        return res.status(404).send('Director tidak ditemukan!');
    }
    const { fullname, birthYear } = req.body;
    if (!fullname || !birthYear) {
        return res.status(400).send('Field fullname dan birthYear wajib diisi.');
    }
    director.fullname = fullname;
    director.birthYear = Number(birthYear);
    res.json(director);
});

// Hapus director
app.delete('/directors/id/:directorId', (req, res) => {
    const id = Number(req.params.directorId);
    const idx = directorList.findIndex(d => d.directorId === id);
    if (idx === -1) {
        return res.status(404).send('Director tidak ditemukan!');
    }
    const removed = directorList.splice(idx, 1);
    res.json(removed[0]);
});

app.listen(PORT, () => {
    console.log(`API berjalan di http://localhost:${PORT}`);
});

