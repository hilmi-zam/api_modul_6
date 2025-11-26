const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_prod';

// Middleware untuk validasi JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token diperlukan' });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(403).json({ error: 'Token tidak valid' });
    }
    // Extract user info dari payload
    req.user = payload.user || payload;
    next();
  });
}

// Middleware untuk validasi role user
function authorizeRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User tidak ditemukan' });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ error: `Akses ditolak: hanya ${requiredRole} yang diizinkan` });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRole
};
