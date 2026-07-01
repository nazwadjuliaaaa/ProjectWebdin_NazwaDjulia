# 🎓 Sistem Informasi Kampus - Next.js & Express.js CRUD API

Aplikasi Web Sistem Informasi Kampus untuk mengelola data Mahasiswa, Program Studi (Prodi), dan Pengguna (User). Dibangun menggunakan stack **Next.js** untuk Frontend dan **Express.js (TypeScript) + MySQL** untuk Backend.

---

## 📌 Tugas Mingguan (Pertemuan 12 - 15)
Repositori ini telah diperbarui untuk memenuhi seluruh kriteria **Tugas Mingguan** yang tercantum dalam modul pertemuan 12 hingga 15:

### 1. Relasi Database (Pertemuan 12)
* Menggunakan tabel relasional `prodi` dan `mahasiswa` dengan `prodi_id` sebagai *foreign key*.
* Master data program studi di-insert secara default (`Informatika`, `Sistem Informasi`, `Teknik Elektro`, `Manajemen`, `Akuntansi`).

### 2. Upload Foto Mahasiswa (Pertemuan 12)
* Integrasi **Multer** pada backend untuk proses upload foto mahasiswa (maksimal 2 MB, hanya JPG/PNG/WEBP).
* Validasi error ukuran file di-handle secara dinamis melalui global error handler Express.js.
* Menampilkan foto mahasiswa atau avatar inisial (fallback) pada tabel di frontend Next.js.
* Preview foto secara real-time pada Form Tambah/Edit sebelum data disimpan.

### 3. Pencarian, Filter & Pagination (Pertemuan 12)
* **Search**: Pencarian mahasiswa berdasarkan nama atau NIM secara dinamis.
* **Filter**: Penyaringan data berdasarkan Program Studi (Prodi).
* **Pagination**: Pembagian halaman dengan fitur *Previous*, *Next*, serta indikator halaman aktif.

### 4. Autentikasi JWT & Session Management (Pertemuan 13)
* Fitur **Register** (default role `viewer`) dan **Login** menggunakan enkripsi password dengan **Bcrypt**.
* Generate **JWT Token** setelah login berhasil, disimpan secara aman di sisi client (`localStorage`).
* Autentikasi terlindungi menggunakan middleware `verifyToken`.

### 5. Otorisasi Peran / Role Authorization (Pertemuan 14)
Membatasi hak akses pengguna berdasarkan peran (*role*):
* **Admin**: Akses penuh (CRUD Mahasiswa, CRUD User, Reset Password User).
* **Operator**: Dapat mengelola data mahasiswa (CRUD Mahasiswa & Upload Foto), tetapi tidak dapat mengakses manajemen user.
* **Viewer**: Hanya dapat melihat, mencari, dan memfilter data mahasiswa (tombol aksi CRUD disembunyikan/dinonaktifkan).

### 6. Manajemen User & Reset Password (Pertemuan 15)
* Halaman khusus **Manajemen User** (hanya bisa diakses oleh Admin) untuk melihat daftar pengguna, menambah user baru dengan role tertentu, mengubah informasi user, mereset password user, dan menghapus user.

---

## 🛠️ Tech Stack & Dependencies

### Backend (Express.js + TypeScript)
* **Express.js** (Framework API)
* **TypeScript** & **ts-node** (Type safety & compiler)
* **mysql2** (Database client)
* **Multer** (Multipart form-data handler / file upload)
* **bcrypt** (Password hashing)
* **jsonwebtoken (JWT)** (User authentication)
* **nodemon** (Development auto-restart)

### Frontend (Next.js)
* **Next.js** (App Router)
* **TypeScript**
* **CSS Vanilla** (Desain responsif, modern, dan clean)

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Prasyarat
* Node.js terinstal di komputer.
* MySQL Server terinstal (XAMPP / Laragon).

### 2. Konfigurasi Database
1. Aktifkan MySQL di XAMPP/Laragon.
2. Buat database baru bernama `kampus` di phpMyAdmin.
3. Import file database yang berada di `/backend/database.sql` atau jalankan query SQL tersebut.

### 3. Menjalankan Backend (Port 3000)
```bash
cd backend
npm install
npm run dev
```
Backend akan aktif di `http://localhost:3000`.

### 4. Menjalankan Frontend (Port 3001)
```bash
cd frontend-next-express-crud
npm install
npm run dev -- -p 3001
```
Frontend akan aktif di `http://localhost:3001`.

---

## 🔑 Akun Demo Pengujian

Anda dapat menguji ketiga role yang berbeda dengan akun berikut (semua password adalah `admin123`):

| Email | Password | Role | Hak Akses |
|-------|----------|------|-----------|
| `admin@kampus.ac.id` | `admin123` | **Admin** | CRUD Mahasiswa + CRUD User + Reset Password |
| `operator@kampus.ac.id` | `admin123` | **Operator** | CRUD Mahasiswa + Upload Foto |
| `viewer@kampus.ac.id` | `admin123` | **Viewer** | Hanya Lihat, Cari, dan Filter Mahasiswa |
