# Multi-Tenant SaaS Backend — Laravel API

Backend API untuk aplikasi SaaS multi-tenant berbasis Laravel 13 + Sanctum. Dirancang sebagai **headless API** yang bisa dikonsumsi oleh frontend apapun (React, Vue, Next.js, mobile, dll).

---

## Tech Stack

- **Laravel 13** — PHP framework
- **Laravel Sanctum** — Token-based API authentication
- **SQLite** — Database default (mudah diganti ke MySQL/PostgreSQL)
- **Single-database multi-tenancy** — Isolasi data via global scope + header

---

## Cara Menjalankan

```bash
# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Jalankan migrasi + seeder
php artisan migrate --seed

# Jalankan server
php artisan serve
```

Server berjalan di `http://localhost:8000`.

---

## Struktur Database

| Tabel | Deskripsi |
|---|---|
| `users` | Akun pengguna, memiliki flag `is_superadmin` |
| `tenants` | Data organisasi/workspace (name, domain, is_active) |
| `tenant_user` | Pivot: relasi user ↔ tenant dengan kolom `role` |
| `products` | Contoh model yang di-scope per tenant |
| `personal_access_tokens` | Token Sanctum |

---

## Sistem Multi-Tenancy

Proyek ini menggunakan **single-database multi-tenancy**. Setiap request ke endpoint tenant harus menyertakan header:

```
X-Tenant-Domain: nama-domain-tenant
```

### Alur Kerja

1. Middleware `CheckTenantHeader` membaca header `X-Tenant-Domain`
2. Tenant dicari di database berdasarkan domain, harus aktif (`is_active = true`)
3. Validasi bahwa user yang login memiliki akses ke tenant tersebut
4. `TenantManager` service menyimpan konteks tenant untuk lifecycle request
5. Model yang menggunakan trait `BelongsToTenant` otomatis di-filter berdasarkan tenant aktif

### Menambahkan Model Baru yang Tenant-Scoped

```php
use App\Traits\BelongsToTenant;

class YourModel extends Model
{
    use BelongsToTenant;
}
```

Cukup tambahkan trait tersebut — query otomatis di-scope ke tenant aktif, dan `tenant_id` otomatis diisi saat create.

---

## API Endpoints

Base URL: `http://localhost:8000/api`

### Authentication

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| `POST` | `/login` | ❌ | Login, mengembalikan Bearer token |
| `POST` | `/logout` | ✅ | Hapus token aktif |
| `GET` | `/me` | ✅ | Data user yang sedang login (beserta tenants) |

**Request Login:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response Login:**
```json
{
  "message": "Login berhasil",
  "access_token": "1|abc123...",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com",
    "is_superadmin": true,
    "tenants": []
  }
}
```

---

### Superadmin Endpoints

> Semua endpoint ini memerlukan autentikasi (`Authorization: Bearer {token}`).
> Tidak ada middleware role khusus saat ini — pastikan hanya superadmin yang bisa mengaksesnya dari sisi frontend/client.

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/superadmin/tenants` | List semua tenant |
| `POST` | `/superadmin/tenants` | Buat tenant baru |
| `GET` | `/superadmin/users` | List semua user (beserta tenant terkait) |
| `POST` | `/superadmin/users` | Buat user baru dan assign ke tenant |
| `DELETE` | `/superadmin/users/{id}` | Hapus user dan detach dari semua tenant |

**POST `/superadmin/tenants`:**
```json
{
  "name": "Nama Perusahaan",
  "domain": "nama-domain"
}
```

**POST `/superadmin/users`:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "rahasia123",
  "tenant_id": 1,
  "role": "admin"
}
```
> `password` opsional — default ke `password123` jika kosong.
> `role` opsional — default ke `admin`.

---

### Tenant Endpoints

> Memerlukan autentikasi + header `X-Tenant-Domain`.

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/tenant/users` | List user dalam tenant aktif |
| `POST` | `/tenant/users` | Invite/tambah user ke tenant |

**POST `/tenant/users`:**
```json
{
  "name": "Jane Smith",
  "email": "jane@company.com"
}
```
> Jika email sudah ada, user yang ada akan di-attach ke tenant. Jika belum, user baru dibuat dengan password default `password123` dan role `staff`.

---

### Endpoint Publik

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/products` | List produk (tanpa auth, tanpa tenant scope) |

---

## Cara Integrasi dari Frontend Lain

### 1. Autentikasi

Kirim request login, simpan `access_token` yang dikembalikan, lalu sertakan di setiap request berikutnya:

```
Authorization: Bearer {access_token}
```

### 2. Akses Endpoint Tenant

Untuk endpoint di bawah `/api/tenant/*`, wajib menyertakan header tambahan:

```
X-Tenant-Domain: nama-domain-tenant
```

Domain tenant bisa didapat dari data `user.tenants[].domain` setelah login.

### 3. Contoh Request (JavaScript/Fetch)

```js
// Login
const res = await fetch('http://localhost:8000/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password' })
})
const { access_token, user } = await res.json()

// Akses tenant endpoint
const users = await fetch('http://localhost:8000/api/tenant/users', {
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'X-Tenant-Domain': user.tenants[0].domain
  }
})
```

### 4. Contoh Request (Axios)

```js
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000/api' })

// Interceptor untuk inject token dan tenant domain
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token')
  const tenantDomain = localStorage.getItem('tenant_domain')

  if (token) config.headers['Authorization'] = `Bearer ${token}`
  if (tenantDomain) config.headers['X-Tenant-Domain'] = tenantDomain

  return config
})
```

---

## Roles

| Role | Deskripsi |
|---|---|
| `is_superadmin = true` | Akses global ke semua tenant dan user |
| `admin` | Role default saat user di-assign ke tenant via superadmin |
| `staff` | Role default saat user di-invite via tenant endpoint |

Role disimpan di tabel pivot `tenant_user.role`. Saat ini belum ada middleware role enforcement di backend — validasi role dilakukan di sisi frontend atau bisa ditambahkan sesuai kebutuhan.

---

## CORS

CORS dikonfigurasi di `config/cors.php`. Untuk development, pastikan origin frontend sudah diizinkan. Ubah `allowed_origins` sesuai URL frontend kamu.

---

## Catatan untuk Production

- Ganti SQLite ke MySQL/PostgreSQL di `.env`
- Set `APP_ENV=production` dan `APP_DEBUG=false`
- Tambahkan rate limiting pada endpoint auth
- Implementasikan email verification untuk user yang di-invite
- Pertimbangkan subdomain routing untuk isolasi tenant yang lebih kuat
