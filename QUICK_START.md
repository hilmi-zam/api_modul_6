# 🎬 RBAC MODUL 6 - QUICK START & TESTING CHECKLIST

## ⚡ QUICK START (5 Menit)

### 1. Start Server
```bash
cd "e:\zami\interoperabilitas\Modul 6"
node server.js
```
✅ Output: `Server aktif di http://localhost:3200`

### 2. Open Postman
Buat request baru dengan langkah-langkah di bawah

---

## 📋 TESTING CHECKLIST - Copy & Paste Ready

### ✅ REQUEST 1: Registrasi User Biasa
```
Method: POST
URL: http://localhost:3200/auth/register
Headers: Content-Type: application/json

Body:
{
  "username": "user1",
  "email": "user1@example.com",
  "password": "password123"
}

Expected: 201 Created
Response: { "id": 2, "username": "user1", "email": "user1@example.com", "role": "user" }
✅ Periksa: ada "role": "user"
```

---

### ✅ REQUEST 2: Registrasi Admin
```
Method: POST
URL: http://localhost:3200/auth/register-admin
Headers: Content-Type: application/json

Body:
{
  "username": "admin1",
  "email": "admin1@example.com",
  "password": "admin123"
}

Expected: 201 Created
Response: { "id": 3, "username": "admin1", "email": "admin1@example.com", "role": "admin" }
✅ Periksa: ada "role": "admin"
```

---

### ✅ REQUEST 3: Login User → SAVE TOKEN
```
Method: POST
URL: http://localhost:3200/auth/login
Headers: Content-Type: application/json

Body:
{
  "username": "user1",
  "password": "password123"
}

Expected: 200 OK
Response: { "token": "eyJhbGciOi..." }

⚠️ SAVE TOKEN → Gunakan sebagai [USER_TOKEN] di request berikutnya
Contoh: Authorization: Bearer eyJhbGciOi...
```

---

### ✅ REQUEST 4: User POST /movies (HARUS BERHASIL ✓)
```
Method: POST
URL: http://localhost:3200/movies
Headers: 
  Content-Type: application/json
  Authorization: Bearer [USER_TOKEN]

Body:
{
  "title": "Inception",
  "director": "Christopher Nolan",
  "year": 2010
}

Expected: 201 Created
✅ HASIL: User BISA membuat film
```

---

### ❌ REQUEST 5: User DELETE /movies (HARUS GAGAL ✗)
```
Method: DELETE
URL: http://localhost:3200/movies/1
Headers: Authorization: Bearer [USER_TOKEN]

Expected: 403 Forbidden
Response: { "error": "Akses ditolak: hanya admin yang diizinkan" }
❌ HASIL: User TIDAK BISA menghapus film (sebagaimana diharapkan)
```

---

### ❌ REQUEST 6: User PUT /movies (HARUS GAGAL ✗)
```
Method: PUT
URL: http://localhost:3200/movies/1
Headers: 
  Content-Type: application/json
  Authorization: Bearer [USER_TOKEN]

Body:
{
  "title": "Inception - Updated",
  "director": "Christopher Nolan",
  "year": 2010
}

Expected: 403 Forbidden
Response: { "error": "Akses ditolak: hanya admin yang diizinkan" }
❌ HASIL: User TIDAK BISA mengupdate film (sebagaimana diharapkan)
```

---

### ✅ REQUEST 7: Login Admin → SAVE TOKEN
```
Method: POST
URL: http://localhost:3200/auth/login
Headers: Content-Type: application/json

Body:
{
  "username": "admin1",
  "password": "admin123"
}

Expected: 200 OK
Response: { "token": "eyJhbGciOi..." }

⚠️ SAVE TOKEN → Gunakan sebagai [ADMIN_TOKEN] di request berikutnya
```

---

### ✅ REQUEST 8: Admin DELETE /movies (HARUS BERHASIL ✓)
```
Method: DELETE
URL: http://localhost:3200/movies/1
Headers: Authorization: Bearer [ADMIN_TOKEN]

Expected: 204 No Content
✅ HASIL: Admin BISA menghapus film
```

---

### ✅ REQUEST 9: Admin PUT /movies (HARUS BERHASIL ✓)
```
Method: PUT
URL: http://localhost:3200/movies/2
Headers: 
  Content-Type: application/json
  Authorization: Bearer [ADMIN_TOKEN]

Body:
{
  "title": "The Dark Knight - Updated by Admin",
  "director": "Christopher Nolan",
  "year": 2008
}

Expected: 200 OK
Response: { "id": 2, "title": "The Dark Knight - Updated by Admin", "director": "Christopher Nolan", "year": 2008 }
✅ HASIL: Admin BISA mengupdate film
```

---

### ✅ REQUEST 10: GET /me (Verify JWT Payload)
```
Method: GET
URL: http://localhost:3200/me
Headers: Authorization: Bearer [USER_TOKEN]

Expected: 200 OK
Response: { "user": { "user": { "id": 2, "username": "user1", "role": "user" } } }

Periksa: "role": "user" ada di response

---

Ulangi dengan [ADMIN_TOKEN]:
Method: GET
URL: http://localhost:3200/me
Headers: Authorization: Bearer [ADMIN_TOKEN]

Expected: 200 OK
Response: { "user": { "user": { "id": 3, "username": "admin1", "role": "admin" } } }

Periksa: "role": "admin" ada di response
```

---

## 📊 HASIL AKHIR - TABEL VERIFIKASI

| # | Test | Method | URL | User | Status | ✅/❌ |
|---|------|--------|-----|------|--------|--------|
| 1 | Register User | POST | /auth/register | - | 201 | ✅ |
| 2 | Register Admin | POST | /auth/register-admin | - | 201 | ✅ |
| 3 | Login User | POST | /auth/login | user1 | 200 | ✅ |
| 4 | User Create Film | POST | /movies | user1 | 201 | ✅ |
| 5 | User Delete Film | DELETE | /movies/1 | user1 | **403** | ❌ |
| 6 | User Update Film | PUT | /movies/1 | user1 | **403** | ❌ |
| 7 | Login Admin | POST | /auth/login | admin1 | 200 | ✅ |
| 8 | Admin Delete Film | DELETE | /movies/1 | admin1 | 204 | ✅ |
| 9 | Admin Update Film | PUT | /movies/2 | admin1 | 200 | ✅ |
| 10 | Check JWT Payload | GET | /me | user1/admin1 | 200 | ✅ |

**JIKA SEMUA HASIL SESUAI TABEL DI ATAS = IMPLEMENTASI BERHASIL! ✅✅✅**

---

## 🔄 LANGKAH-LANGKAH TROUBLESHOOTING

### ❓ Error: "Token diperlukan"
```
Solusi:
1. Pastikan Authorization header ada
2. Format: Authorization: Bearer [TOKEN]
3. Ada spasi setelah "Bearer"
```

### ❓ Error: "Akses ditolak: hanya admin yang diizinkan"
```
Solusi: Ini adalah HASIL YANG BENAR! ✅
User biasa memang TIDAK BOLEH delete/update
Gunakan admin token untuk test endpoint tersebut
```

### ❓ Server tidak berjalan
```
Solusi:
1. Cek apakah sudah di folder Modul 6
2. Pastikan Node.js sudah install: node --version
3. Jalankan: node server.js
4. Jika port 3200 sudah terpakai, cek: Get-NetTCPConnection -LocalPort 3200
```

### ❓ Database belum ada
```
Solusi:
1. Database dibuat otomatis saat server start
2. Lihat console output: "Terhubung ke basis database SQLite"
3. Cek file movies.db muncul di folder
```

---

## 🎯 CHECKLIST FINAL

- [ ] Server running di http://localhost:3200
- [ ] Test 1: User registrasi berhasil (role: 'user')
- [ ] Test 2: Admin registrasi berhasil (role: 'admin')
- [ ] Test 3: User login dapat token
- [ ] Test 4: User POST /movies → 201 ✅
- [ ] Test 5: User DELETE /movies → 403 ❌ (sebagaimana diharapkan)
- [ ] Test 6: User PUT /movies → 403 ❌ (sebagaimana diharapkan)
- [ ] Test 7: Admin login dapat token
- [ ] Test 8: Admin DELETE /movies → 204 ✅
- [ ] Test 9: Admin PUT /movies → 200 ✅
- [ ] Test 10: GET /me menampilkan role ✅

---

## 📚 REFERENSI DOKUMENTASI LAIN

**Di folder ini sudah ada dokumentasi lengkap:**
1. **COMPLETE_GUIDE.md** - Panduan lengkap + penjelasan konsep
2. **POSTMAN_TESTING_GUIDE.md** - Referensi request/response detail
3. **IMPLEMENTATION_SUMMARY.md** - Ringkasan teknis kode
4. **START_HERE.md** - Ringkasan implementasi

---

## 🎉 SELAMAT!

Semua kode sudah siap dan sesuai modul! 
Tinggal follow checklist di atas untuk testing.

**Estimated Testing Time: 15-20 menit**

Jika ada pertanyaan atau error, baca bagian TROUBLESHOOTING atau file COMPLETE_GUIDE.md

**GOOD LUCK! 🚀🎊**
