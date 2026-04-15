# Autohub V3 - Multi-Tenant Template

Dokumentasi ini berisi panduan untuk struktur sistem, cara instalasi, bagaimana menjalankan, dan menggunakan template mandiri ini untuk kebutuhan *multi-tenancy*.

## 📂 Struktur Direktori

Sistem ini terbagi ke dalam dua bagian utama:
1. **`backend/`**: Dibangun menggunakan PHP 8.3 & Laravel 13. Berfungsi sebagai **API Engine** dan pusat manajemen database multi-tenant. Menggunakan arsitektur *Single-Database* dengan *Row-Level Isolation*.
2. **`frontend/`**: Dibangun menggunakan React + Vite. Merupakan **SPA Dashboard** yang mengelola antarmuka pengguna, Superadmin, dan Tenant Admin dalam satu kesatuan aplikasi yang ringan.

---

## ⚙️ Prasyarat (Requirements)

Sebelum memulai, pastikan perangkat Anda telah terinstal beberapa poin di bawah ini:
- **PHP** >= 8.3
- **Composer** (versi terbaru)
- **Node.js** (v18 atau lebih baru)
- **Database**: SQLite (default untuk pengembangan lokal).

---

## 🚀 Cara Memulai & Instalasi (Setup)

### 1. Setup Backend (Laravel)
```bash
cd backend
composer run setup
```
*(Script ini otomatis melakukan install vendor, copy .env, generate key, dan migrasi database).*

### 2. Setup Frontend (React)
```bash
cd frontend
npm install
```

---

## 🏃 Cara Menjalankan Sistem

Gunakan dua terminal terpisah untuk menjalankan server:

### Menjalankan Backend (API)
Di folder `backend/`:
```bash
composer run dev
```
Akses API di: 👉 **[http://localhost:8000](http://localhost:8000)**

### Menjalankan Frontend (Client & Dashboard)
Di folder `frontend/`:
```bash
npm run dev
```
Akses UI di: 👉 **[http://localhost:5174](http://localhost:5174)**

---

## 🛠 Panduan Menggunakan Sistem

### 1. Dashboard Superadmin (Global Management)
- Akses melalui: **`http://localhost:5174/superadmin`**
- Fungsi: Menambah/mengelola Tenant (perusahaan) baru secara global.
- **Akun Testing**: `admin@example.com` (Password: `password`).

### 2. Dashboard Tenant (Workspace Management)
- Akses melalui path: **`http://localhost:5174/[domain-tenant]`**
- Contoh: **`http://localhost:5174/otoproject`** atau **`http://localhost:5174/default-tenant`**.
- Fungsi: Mengelola data user yang terisolasi khusus untuk tenant yang didefinisikan di URL.

### 3. Integrasi API & CORS
- Konfigurasi CORS sudah terpasang untuk mengizinkan akses dari port frontend.
- Deteksi Tenant: Frontend secara otomatis mengambil segmen pertama dari URL path dan mengirimkannya via header `X-Tenant-Domain` ke API Laravel.

---

## 🔒 Keamanan & Database
- Secara default menggunakan **SQLite**.
- Jika ingin pindah ke MySQL/Postgres, ubah file `backend/.env` pada bagian `DB_CONNECTION`.
- Data user antar tenant dipisahkan menggunakan *Global Scopes* di level model Laravel untuk mencegah kebocoran data.
