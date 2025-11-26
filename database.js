require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

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

    // Create users table (username and email unique)
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user'
      )`,
      (err) => {
        if (err) {
          return console.error("Gagal membuat tabel users:", err.message);
        }

        // Check if users table is empty
        db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
          if (err) {
            return console.error(err.message);
          }

          // Insert initial user if users table is empty
          if (row.count === 0) {
            console.log("Menambahkan data awal ke tabel users...");
            const insert = `INSERT INTO users (username, email, password) VALUES (?,?,?)`;
            // NOTE: hash the admin password for the seeded user
            const hashed = bcrypt.hashSync('admin123', 10);
            db.run(insert, ["admin", "admin@example.com", hashed]);
          }
        });
      }
    );
  }
});

// Helper functions (minimal wrappers) for reuse in server
// Movies
db.getAllMovies = function (callback) {
  db.all("SELECT * FROM movies ORDER BY id ASC", [], callback);
};

db.getMovieById = function (id, callback) {
  db.get("SELECT * FROM movies WHERE id = ?", [id], callback);
};

db.createMovie = function (movie, callback) {
  const { title, director, year } = movie;
  db.run(
    `INSERT INTO movies (title, director, year) VALUES (?,?,?)`,
    [title, director, year],
    function (err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID, title, director, year });
    },
  );
};

db.updateMovie = function (id, movie, callback) {
  const { title, director, year } = movie;
  db.run(
    `UPDATE movies SET title = ?, director = ?, year = ? WHERE id = ?`,
    [title, director, year, id],
    function (err) {
      if (err) return callback(err);
      callback(null, this.changes);
    },
  );
};

db.deleteMovie = function (id, callback) {
  db.run(`DELETE FROM movies WHERE id = ?`, [id], function (err) {
    if (err) return callback(err);
    callback(null, this.changes);
  });
};

// Directors
db.getAllDirectors = function (callback) {
  db.all("SELECT * FROM directors ORDER BY id ASC", [], callback);
};

db.getDirectorById = function (id, callback) {
  db.get("SELECT * FROM directors WHERE id = ?", [id], callback);
};

db.createDirector = function (director, callback) {
  const { name, nationality, birth_year } = director;
  db.run(
    `INSERT INTO directors (name, nationality, birth_year) VALUES (?,?,?)`,
    [name, nationality, birth_year],
    function (err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID, name, nationality, birth_year });
    },
  );
};

// Users
db.createUser = function (user, callback) {
  const { username, email, password, role = 'user' } = user;
  const hashed = bcrypt.hashSync(password, 10);
  db.run(
    `INSERT INTO users (username, email, password, role) VALUES (?,?,?,?)`,
    [username, email, hashed, role],
    function (err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID, username, email, role });
    },
  );
};

db.getUserByUsername = function (username, callback) {
  db.get(`SELECT * FROM users WHERE username = ?`, [username], callback);
};

db.getUserByEmail = function (email, callback) {
  db.get(`SELECT * FROM users WHERE email = ?`, [email], callback);
};

db.getAllUsers = function (callback) {
  db.all(`SELECT id, username, email, role FROM users ORDER BY id ASC`, [], callback);
};

module.exports = db;