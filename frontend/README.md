# Multi-Tenant SaaS Frontend — React + Vite

Frontend referensi untuk backend multi-tenant Laravel. Dibangun dengan React 19 + Vite, bisa dipakai langsung atau dijadikan referensi implementasi untuk frontend lain.

---

## Tech Stack

- **React 19** + **Vite**
- **React Router v7** — Client-side routing
- **Axios** — HTTP client dengan interceptors
- **Framer Motion** — Animasi halaman dan modal
- **Lucide React** — Icon library
- **CSS custom** — Desain glass-morphism

---

## Cara Menjalankan

```bash
# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Pastikan backend Laravel sudah berjalan di `http://localhost:8000`.

---

## Struktur Folder

```
src/
├── pages/
│   ├── LandingPage.jsx         # Halaman publik
│   ├── LoginPage.jsx           # Form login (support tenant-specific)
│   ├── SuperadminDashboard.jsx # Panel superadmin
│   └── TenantDashboard.jsx     # Dashboard per tenant
├── components/
│   ├── ProtectedRoute.jsx      # Guard route berdasarkan token
│   ├── Modal.jsx               # Modal reusable
│   └── Skeleton.jsx            # Loading placeholder
├── context/
│   └── ToastContext.jsx        # Notifikasi toast global
├── axios.js                    # Konfigurasi Axios + interceptors
├── App.jsx                     # Routing utama
└── main.jsx                    # Entry point
```

---

## Routing

| Path | Komponen | Auth |
|---|---|---|
| `/` | LandingPage | ❌ |
| `/login` | LoginPage | ❌ |
| `/:tenantDomain/login` | LoginPage (tenant-specific) | ❌ |
| `/superadmin` | SuperadminDashboard | ✅ |
| `/superadmin/:tab` | SuperadminDashboard (tab: `tenants` / `users`) | ✅ |
| `/:tenantDomain` | TenantDashboard | ✅ |

---

## Alur Autentikasi

1. User submit email + password di `LoginPage`
2. Frontend POST ke `/api/login`
3. Token dan data user disimpan di `localStorage`
4. Axios interceptor otomatis inject `Authorization: Bearer {token}` ke semua request
5. `ProtectedRoute` cek token di localStorage — redirect ke login jika tidak ada
6. Saat logout, token dihapus dari backend dan localStorage, redirect ke `/login`

**Data yang disimpan di localStorage:**
- `auth_token` — Bearer token dari Sanctum
- `user` — Object user (JSON string) termasuk daftar tenant

---

## Alur Tenant Context

Frontend mengekstrak domain tenant dari URL path secara otomatis:

```
URL: /otoproject  →  X-Tenant-Domain: otoproject
URL: /superadmin  →  X-Tenant-Domain: default-tenant (diabaikan backend)
```

Logika ini ada di `src/axios.js`:

```js
const getTenantDomain = () => {
  const parts = window.location.pathname.split('/').filter(p => p !== '')
  if (parts.length > 0 && !['superadmin', 'admin', 'login'].includes(parts[0])) {
    return parts[0]
  }
  return 'default-tenant'
}
```

Header `X-Tenant-Domain` dikirim di **setiap request** — backend akan mengabaikannya untuk endpoint yang tidak memerlukan tenant context.

---

## Konfigurasi Axios (`src/axios.js`)

```js
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
})
```

Ubah `baseURL` sesuai URL backend kamu. Untuk production, gunakan environment variable:

```js
baseURL: import.meta.env.VITE_API_URL
```

Tambahkan di `.env`:
```
VITE_API_URL=https://api.yourdomain.com
```

---

## Komponen Utama

### `ProtectedRoute`

Membungkus route yang memerlukan autentikasi. Jika token tidak ada, redirect ke login. Jika berada di path tenant, redirect ke `/:tenantDomain/login`.

```jsx
<Route path="/:tenantDomain" element={
  <ProtectedRoute>
    <TenantDashboard />
  </ProtectedRoute>
} />
```

### `Modal`

Modal reusable dengan animasi Framer Motion.

```jsx
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Judul Modal">
  {/* konten */}
</Modal>
```

### `ToastContext`

Notifikasi toast global. Gunakan hook `useToast()`:

```jsx
const { addToast } = useToast()

addToast('Berhasil disimpan!')           // success (default)
addToast('Terjadi kesalahan', 'error')   // error
addToast('Logged out', 'info')           // info
```

Toast otomatis hilang setelah 4 detik.

### `Skeleton`

Loading placeholder untuk tabel:

```jsx
import { TableSkeleton } from '../components/Skeleton'

{loading ? <TableSkeleton rows={6} cols={4} /> : <table>...</table>}
```

---

## Menggunakan Backend Ini dengan Frontend Lain

Jika kamu ingin pakai backend ini tapi dengan frontend yang berbeda (Vue, Next.js, mobile, dll), berikut yang perlu diimplementasikan:

### 1. Login & Simpan Token

```
POST /api/login
Body: { email, password }
Response: { access_token, user }
```

Simpan `access_token` dan data `user` (terutama `user.tenants` dan `user.is_superadmin`).

### 2. Inject Header di Setiap Request

```
Authorization: Bearer {access_token}
```

Untuk endpoint tenant (`/api/tenant/*`), tambahkan:

```
X-Tenant-Domain: {domain-tenant}
```

### 3. Routing Logic

- Jika `user.is_superadmin === true` → arahkan ke panel superadmin
- Jika tidak → arahkan ke `/{user.tenants[0].domain}`
- Jika user tidak punya tenant → tampilkan error

### 4. Handle 401

Jika response status `401`, hapus token dan redirect ke halaman login.

---

## Build untuk Production

```bash
npm run build
```

Output ada di folder `dist/`. Deploy ke static hosting (Vercel, Netlify, Nginx, dll).

Pastikan server dikonfigurasi untuk serve `index.html` untuk semua route (SPA fallback).

**Contoh konfigurasi Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```
