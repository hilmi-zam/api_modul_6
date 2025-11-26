# Modul 6: RBAC (Role-Based Access Control) - Interoperability

Proyek ini mengimplementasikan sistem Role-Based Access Control (RBAC) pada API Film & Sutradara menggunakan Node.js, Express, dan SQLite dengan JWT authentication.

---

## Deskripsi Tugas

Implementasi middleware autentikasi dan otorisasi untuk membatasi akses endpoint berdasarkan role user:
- **User Role**: Dapat membaca, membuat data, tapi tidak dapat mengubah atau menghapus.
- **Admin Role**: Dapat melakukan semua operasi (CRUD).

---

## Fitur yang Diimplementasikan

### 1. Authentication (JWT)
- User dapat register dan login
- Setiap login menghasilkan JWT token yang berlaku 1 jam
- Token berisi user info: `id`, `username`, `role`

### 2. Authorization (Role-Based)
- 2 Role: `user` (default), `admin`
- Middleware `authorizeRole(role)` mengecek role user sebelum akses endpoint tertentu
- Middleware `authenticateToken` memvalidasi JWT token

### 3. Access Control per Endpoint

#### Movies (`/movies`)
| Endpoint | Method | Auth | Role Check | User | Admin |
|----------|--------|------|-----------|------|-------|
| `/movies` | GET | No | No | Yes | Yes |
| `/movies/:id` | GET | No | No | Yes | Yes |
| `/movies` | POST | Yes | No | Yes | Yes |
| `/movies/:id` | PUT | Yes | Admin | No | Yes |
| `/movies/:id` | DELETE | Yes | Admin | No | Yes |

#### Directors (`/directors`)
| Endpoint | Method | Auth | Role Check | User | Admin |
|----------|--------|------|-----------|------|-------|
| `/directors` | GET | No | No | Yes | Yes |
| `/directors/:id` | GET | No | No | Yes | Yes |
| `/directors` | POST | Yes | No | Yes | Yes |
| `/directors/:id` | PUT | Yes | Admin | No | Yes |
| `/directors/:id` | DELETE | Yes | Admin | No | Yes |

#### Authentication (`/auth`)
| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/auth/register` | POST | Daftar user baru (default role: 'user') |
| `/auth/register-admin` | POST | Daftar admin baru (role: 'admin') |
| `/auth/login` | POST | Login & dapatkan JWT token |

---

## Struktur Proyek

```
Modul 6/
├── server.js                    - Main app dengan routes
├── database.js                  - SQLite setup & helper functions
├── middleware/
│   └── auth.js                  - Middleware authenticateToken & authorizeRole
├── scripts/
│   └── create_director.js       - CLI script untuk membuat director
├── package.json                 - Dependencies
├── .env                         - Environment variables (JWT_SECRET, PORT)
├── movies.db                    - SQLite database (auto-created)
└── README.md                    - File ini
```

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Server
```bash
node server.js
```

Output yang diharapkan:
```
Server aktif di http://localhost:3200
Terhubung ke basis data SQLite.
Menambahkan data awal ke tabel movies...
Menambahkan data awal ke tabel directors...
Menambahkan data awal ke tabel users...
```

### 3. Gunakan Postman untuk Testing
Lihat bagian Testing di Postman di bawah.

---

## Testing di Postman

### Step 1: Registrasi User Biasa
```
POST http://localhost:3200/auth/register
Content-Type: application/json

{
  "username": "user1",
  "email": "user1@example.com",
  "password": "password123"
}
```
✓ Expected: `201 Created` dengan `"role": "user"`

---

### Step 2: Registrasi Admin
```
POST http://localhost:3200/auth/register-admin
Content-Type: application/json

{
  "username": "admin1",
  "email": "admin1@example.com",
  "password": "admin123"
}
```
✓ Expected: `201 Created` dengan `"role": "admin"`

---

### Step 3: Login sebagai User - Dapatkan Token
```
POST http://localhost:3200/auth/login
Content-Type: application/json

{
  "username": "user1",
  "password": "password123"
}
```
✓ Expected: `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
Simpan token ini sebagai [USER_TOKEN]

---

### Step 4: User POST /directors (Harus Berhasil)
```
POST http://localhost:3200/directors
Content-Type: application/json
Authorization: Bearer [USER_TOKEN]

{
  "name": "Hayao Miyazaki",
  "nationality": "Japan",
  "birth_year": 1941
}
```
✓ Expected: `201 Created` - User dapat membuat director

---

### Step 5: User DELETE /directors (Harus Gagal 403)
```
DELETE http://localhost:3200/directors/1
Authorization: Bearer [USER_TOKEN]
```
✗ Expected: `403 Forbidden`
```json
{
  "error": "Akses ditolak: hanya admin yang diizinkan"
}
```
User tidak dapat menghapus director (sesuai role).

---

### Step 6: User PUT /directors (Harus Gagal 403)
```
PUT http://localhost:3200/directors/1
Content-Type: application/json
Authorization: Bearer [USER_TOKEN]

{
  "name": "Hayao Miyazaki Updated",
  "nationality": "Japan",
  "birth_year": 1941
}
```
✗ Expected: `403 Forbidden`
User tidak dapat mengubah director.

---

### Step 7: Login sebagai Admin - Dapatkan Token
```
POST http://localhost:3200/auth/login
Content-Type: application/json

{
  "username": "admin1",
  "password": "admin123"
}
```
✓ Expected: `200 OK`
Simpan token ini sebagai [ADMIN_TOKEN]

---

### Step 8: Admin DELETE /directors (Harus Berhasil 204)
```
DELETE http://localhost:3200/directors/1
Authorization: Bearer [ADMIN_TOKEN]
```
✓ Expected: `204 No Content` (empty body)
Admin dapat menghapus director.

---

### Step 9: Admin PUT /directors (Harus Berhasil 200)
```
PUT http://localhost:3200/directors/2
Content-Type: application/json
Authorization: Bearer [ADMIN_TOKEN]

{
  "name": "Akira Kurosawa Updated",
  "nationality": "Japan",
  "birth_year": 1910
}
```
✓ Expected: `200 OK`
Admin dapat mengubah director.

---

## CLI Scripts

### Membuat Director via Script
```bash
node scripts/create_director.js "Hayao Miyazaki" "Japan" 1941
```

Output:
```
Director created: { id: 4, name: 'Hayao Miyazaki', nationality: 'Japan', birth_year: 1941 }
```

---

## Database Schema

### Tabel: users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user'
);
```

### Tabel: movies
```sql
CREATE TABLE movies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  director TEXT NOT NULL,
  year INTEGER NOT NULL
);
```

### Tabel: directors
```sql
CREATE TABLE directors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  nationality TEXT,
  birth_year INTEGER
);
```

---

## JWT Payload Structure

Saat user/admin login, token berisi:
```json
{
  "user": {
    "id": 1,
    "username": "user1",
    "role": "user"
  },
  "iat": 1732612345,
  "exp": 1732615945
}
```

Middleware `authenticateToken` akan:
1. Validasi signature & expiry token
2. Extract user info ke `req.user`
3. Lanjutkan ke handler jika valid

Middleware `authorizeRole('admin')` akan:
1. Cek `req.user.role === 'admin'`
2. Return `403 Forbidden` jika role tidak cocok
3. Lanjutkan jika cocok

---

## Implementasi Detail

### File: `middleware/auth.js`
```javascript
function authenticateToken(req, res, next) {
  // Validasi JWT token dari header Authorization
  // Extract user info ke req.user
  // Return 401 jika token tidak ada, 403 jika invalid
}

function authorizeRole(requiredRole) {
  // Higher-order middleware
  // Return middleware yang cek req.user.role === requiredRole
  // Return 403 jika role tidak cocok
}
```

### File: `server.js`
Contoh penerapan middleware pada route `/directors`:
```javascript
// GET - Public (no auth)
app.get('/directors', (req, res) => { ... });

// GET/:id - Public (no auth)
app.get('/directors/:id', (req, res) => { ... });

// POST - Login required (any role)
app.post('/directors', authenticateToken, (req, res) => { ... });

// PUT - Admin only
app.put('/directors/:id', authenticateToken, authorizeRole('admin'), (req, res) => { ... });

// DELETE - Admin only
app.delete('/directors/:id', authenticateToken, authorizeRole('admin'), (req, res) => { ... });
```

---

## Konsep yang Dipelajari

### Authentication
- Login menghasilkan JWT token
- Token berisi user info & role

### Authorization
- Middleware memvalidasi token & role
- Setiap endpoint punya aturan akses berbeda

### Middleware Berlapis
```javascript
app.delete('/directors/:id', authenticateToken, authorizeRole('admin'), handler);
```
- Request harus lolos `authenticateToken` dulu (401/403)
- Jika lolos, baru cek `authorizeRole('admin')` (403 jika bukan admin)
- Jika lolos, baru eksekusi handler

### Role-Based Access Control (RBAC)
- Assign role ke user saat register
- Restrict endpoint berdasarkan role
- Admin lebih powerful dari user biasa

---

## Environment Variables

File `.env` (jika perlu custom):
```env
PORT=3200
JWT_SECRET=your_secret_key_here
DB_SOURCE=movies.db
```

Default values (jika .env tidak ada):
- `PORT=3200`
- `JWT_SECRET=change_this_secret_in_prod`
- `DB_SOURCE=movies.db`

---

## Testing Checklist

- [ ] Server berjalan di `http://localhost:3200`
- [ ] Registrasi user biasa - `201` dengan `role: 'user'`
- [ ] Registrasi admin - `201` dengan `role: 'admin'`
- [ ] User login - `200` dengan token
- [ ] User POST /directors - `201`
- [ ] User DELETE /directors - `403`
- [ ] User PUT /directors - `403`
- [ ] Admin login - `200` dengan token
- [ ] Admin DELETE /directors - `204`
- [ ] Admin PUT /directors - `200`

Jika semua checklist sesuai = implementasi BERHASIL.

---

## Troubleshooting

### Error: "Token diperlukan"
Solusi: Tambahkan header `Authorization: Bearer [TOKEN]`

### Error: "Akses ditolak: hanya admin yang diizinkan"
Solusi (Expected): Gunakan admin token untuk endpoint yang memerlukan admin

### Error: "Token tidak valid"
Solusi: Token sudah expired (1 jam). Login ulang.

### Database locked
Solusi: Pastikan hanya 1 instance server/script yang akses database

---

## Dokumentasi Tambahan

- QUICK_START.md - Panduan cepat testing dengan copy-paste requests
- 00_READ_ME_FIRST.txt - Summary implementasi & checklist

---

## Kesimpulan

Implementasi RBAC Modul 6 berhasil mengimplementasikan:
- JWT authentication dengan role di payload
- Role-based authorization dengan middleware
- Access control per endpoint sesuai ketentuan
- Database dengan kolom role
- API endpoints yang aman dan terstruktur

Status: SIAP UNTUK PRODUKSI (dengan penyesuaian keamanan di production)

---

Generated: 26 November 2025
Modul: Interoperability - RBAC
Tugas: Praktikum 6
