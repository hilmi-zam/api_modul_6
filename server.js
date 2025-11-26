require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./database.js');
const { authenticateToken, authorizeRole } = require('./middleware/auth.js');

const app = express();
const PORT = process.env.PORT || 3200;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_prod';

app.use(cors());
app.use(express.json());

// Login endpoint (issues JWT)
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username dan password wajib diisi' });

  if (typeof db.getUserByUsername !== 'function') {
    return res.status(500).json({ error: 'Fungsi getUserByUsername tidak tersedia' });
  }

  db.getUserByUsername(username, (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Credensial tidak valid' });

    // Compare hashed password
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Credensial tidak valid' });

    const payload = {
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Return current user info from token
app.get('/me', authenticateToken, (req, res) => {
  // req.user was set in authenticateToken
  res.json({ user: req.user });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({ ok: true, service: 'film-api' });
});

// Get all movies
app.get('/movies', (req, res) => {
  const sql = "SELECT * FROM movies ORDER BY id ASC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get movie by ID
app.get('/movies/:id', (req, res) => {
  const sql = "SELECT * FROM movies WHERE id = ?";
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Film tidak ditemukan' });
    }
    res.json(row);
  });
});

// Add new movie
app.post('/movies', authenticateToken, (req, res) => {
  const { title, director, year } = req.body;

  if (!title || !director || !year) {
    return res.status(400).json({ error: 'title, director, year wajib diisi' });
  }

  const sql = "INSERT INTO movies (title, director, year) VALUES (?,?,?)";
  db.run(sql, [title, director, year], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      title,
      director,
      year,
    });
  });
});

// Update movie (admin only)
app.put('/movies/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  const { title, director, year } = req.body;
  const sql = "UPDATE movies SET title = ?, director = ?, year = ? WHERE id = ?";

  db.run(sql, [title, director, year, req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Film tidak ditemukan' });
    }
    res.json({
      id: Number(req.params.id),
      title,
      director,
      year,
    });
  });
});

// Delete movie (admin only)
app.delete('/movies/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  const sql = "DELETE FROM movies WHERE id = ?";
  db.run(sql, [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Film tidak ditemukan' });
    }
    res.status(204).send();
  });
});

// Get all directors
app.get('/directors', (req, res) => {
  const sql = "SELECT * FROM directors ORDER BY id ASC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get director by ID
app.get('/directors/:id', (req, res) => {
  const sql = "SELECT * FROM directors WHERE id = ?";
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Sutradara tidak ditemukan' });
    }
    res.json(row);
  });
});

// Add new director
app.post('/directors', authenticateToken, (req, res) => {
  const { name, nationality, birth_year } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'name wajib diisi' });
  }

  const sql = "INSERT INTO directors (name, nationality, birth_year) VALUES (?,?,?)";
  db.run(sql, [name, nationality, birth_year], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      name,
      nationality,
      birth_year,
    });
  });
});

// Update director (admin only)
app.put('/directors/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  const { name, nationality, birth_year } = req.body;
  const sql = "UPDATE directors SET name = ?, nationality = ?, birth_year = ? WHERE id = ?";

  db.run(sql, [name, nationality, birth_year, req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Sutradara tidak ditemukan' });
    }
    res.json({
      id: Number(req.params.id),
      name,
      nationality,
      birth_year,
    });
  });
});

// Delete director (admin only)
app.delete('/directors/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
  const sql = "DELETE FROM directors WHERE id = ?";
  db.run(sql, [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Sutradara tidak ditemukan' });
    }
    res.status(204).send();
  });
});

// Get all users (no passwords returned)
app.get('/users', (req, res) => {
  if (typeof db.getAllUsers !== 'function') {
    // fallback: query directly
    db.all('SELECT id, username FROM users ORDER BY id ASC', [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
    return;
  }

  db.getAllUsers((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Register new user
app.post('/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email dan password wajib diisi' });
  }

  // Check username or email exists
  db.getUserByUsername(username, (err, userByName) => {
    if (err) return res.status(500).json({ error: err.message });
    if (userByName) return res.status(409).json({ error: 'Username sudah terdaftar' });

    db.getUserByEmail(email, (err2, userByEmail) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (userByEmail) return res.status(409).json({ error: 'Email sudah terdaftar' });

      // Create user with default role 'user'
      db.createUser({ username, email, password, role: 'user' }, (err3, created) => {
        if (err3) return res.status(500).json({ error: err3.message });
        res.status(201).json(created);
      });
    });
  });
});

// Register new admin (for development only)
app.post('/auth/register-admin', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email dan password wajib diisi' });
  }

  // Check username or email exists
  db.getUserByUsername(username, (err, userByName) => {
    if (err) return res.status(500).json({ error: err.message });
    if (userByName) return res.status(409).json({ error: 'Username sudah terdaftar' });

    db.getUserByEmail(email, (err2, userByEmail) => {
      if (err2) return res.status(500).json({ error: err2.message });
      if (userByEmail) return res.status(409).json({ error: 'Email sudah terdaftar' });

      // Create user with role 'admin'
      db.createUser({ username, email, password, role: 'admin' }, (err3, created) => {
        if (err3) return res.status(500).json({ error: err3.message });
        res.status(201).json(created);
      });
    });
  });
});

// Catch-all route (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Rute tidak ditemukan' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server aktif di http://localhost:${PORT}`);
});