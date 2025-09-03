# Zami Movie API

Aplikasi Node.js sederhana untuk manajemen data **movie** dan **director**. API ini mendukung operasi CRUD untuk kedua entitas dan dapat digunakan untuk belajar membuat RESTful API dengan Express.

## Fitur

- Mendapatkan daftar semua movie dan director
- Mencari movie berdasarkan ID, title, atau director
- Menambah, mengubah, dan menghapus data movie dan director
- Atribut director dilengkapi dengan birthYear

## Teknologi

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)

## Instalasi & Menjalankan

1. **Clone repository:**
   ```
   git clone https://github.com/hilmi-zam/testing_nodejs.git
   ```
2. **Masuk ke folder:**
   ```
   cd zami
   ```
3. **Install dependencies:**
   ```
   npm install
   ```
4. **Jalankan aplikasi:**
   ```
   node server.js
   ```
   atau
   ```
   npm start
   ```

## Endpoint Utama

### Movie
- `GET /movies` — Ambil semua movie
- `GET /movies/id/:movieId` — Ambil movie berdasarkan ID
- `GET /movies/title/:title` — Ambil movie berdasarkan title
- `GET /movies/director/:director` — Ambil movie berdasarkan director
- `POST /movies` — Tambah movie baru
- `DELETE /movies/id/:movieId` — Hapus movie berdasarkan ID

### Director
- `GET /directors` — Ambil semua director
- `GET /directors/id/:directorId` — Ambil director berdasarkan ID
- `POST /directors` — Tambah director baru
- `PUT /directors/id/:directorId` — Update director
- `DELETE /directors/id/:directorId` — Hapus director

### Home
- `GET /home` — Pesan selamat datang

## Contoh Request

**Tambah Movie**
```http
POST /movies
Content-Type: application/json

{
  "title": "Tenet",
  "director": "Christopher Nolan",
  "release": 2020
}
```

**Tambah Director**
```http
POST /directors
Content-Type: application/json

{
  "fullname": "Christopher Nolan",
  "birthYear": 1970
}
```