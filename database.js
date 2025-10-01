require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();

const DB_SOURCE = process.env.DB_SOURCE || "movies.db";

const db = new sqlite3.Database(DB_SOURCE, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  } else {
    console.log('Terhubung ke basis data SQLite.');

    // Create movies table
    db.run(
      `CREATE TABLE IF NOT EXISTS movies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        director TEXT NOT NULL,
        year INTEGER NOT NULL
      )`,
      (err) => {
        if (err) {
          return console.error("Gagal membuat tabel movies:", err.message);
        }

        // Check if movies table is empty
        db.get("SELECT COUNT(*) as count FROM movies", (err, row) => {
          if (err) {
            return console.error(err.message);
          }

          // Insert initial data if movies table is empty
          if (row.count === 0) {
            console.log("Menambahkan data awal ke tabel movies...");
            const insert = `INSERT INTO movies (title, director, year) VALUES (?,?,?)`;
            db.run(insert, ["Parasite", "Bong Joon-ho", 2019]);
            db.run(insert, ["The Dark Knight", "Christopher Nolan", 2008]);
          }
        });
      }
    );

    // Create directors table
    db.run(
      `CREATE TABLE IF NOT EXISTS directors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        nationality TEXT,
        birth_year INTEGER
      )`,
      (err) => {
        if (err) {
          return console.error("Gagal membuat tabel directors:", err.message);
        }

        // Check if directors table is empty
        db.get("SELECT COUNT(*) as count FROM directors", (err, row) => {
          if (err) {
            return console.error(err.message);
          }

          // Insert initial data if directors table is empty
          if (row.count === 0) {
            console.log("Menambahkan data awal ke tabel directors...");
            const insert = `INSERT INTO directors (name, nationality, birth_year) VALUES (?,?,?)`;
            db.run(insert, ["Bong Joon-ho", "South Korean", 1969]);
            db.run(insert, ["Christopher Nolan", "British-American", 1970]);
          }
        });
      }
    );
  }
});

module.exports = db;