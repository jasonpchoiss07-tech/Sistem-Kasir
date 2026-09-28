# POS Toko Bangunan

Sistem kasir (Point of Sale) berbasis web untuk toko bangunan. Monorepo berisi dua aplikasi:

- `backend/` — API server: Node.js + Express + TypeScript + Prisma (PostgreSQL)
- `frontend/` — Web app: React + TypeScript + Vite + Tailwind CSS

> Status: **Step 1 — Project Foundation**. Belum ada fitur bisnis (Product, POS, Dashboard, Checkout, Return, Delivery, Realtime).

---

## Prasyarat

- Node.js 18+ (terverifikasi pada v24)
- npm 9+
- PostgreSQL 14+ (dibutuhkan mulai step migrasi database, belum wajib di Step 1)

---

## Menjalankan Backend

```powershell
cd backend
npm install
npm run dev
```

Server jalan di `http://localhost:4000`. Cek health check: `http://localhost:4000/api/health`.

## Menjalankan Frontend

```powershell
cd frontend
npm install
npm run dev
```

App jalan di `http://localhost:5173`.

---

## Database PostgreSQL (development lokal)

PostgreSQL dijalankan sebagai **binary portable** (tanpa perlu install/admin) di
`D:\pgtools`. Cluster data ada di `D:\pgtools\data` dengan auth `trust` untuk
koneksi lokal (aman untuk development di localhost).

Koneksi (`backend/.env`):

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pos_toko_bangunan?schema=public"
```

### Menjalankan / menghentikan database

PostgreSQL portable tidak berjalan sebagai service, jadi perlu di-start manual
tiap kali komputer dinyalakan:

```powershell
# START
& "D:\pgtools\pgsql\bin\pg_ctl.exe" -D "D:\pgtools\data" -o "-p 5432" -l "D:\pgtools\server.log" start

# STOP
& "D:\pgtools\pgsql\bin\pg_ctl.exe" -D "D:\pgtools\data" stop

# STATUS
& "D:\pgtools\pgsql\bin\pg_ctl.exe" -D "D:\pgtools\data" status
```

### Migrasi & seed

```powershell
cd backend
npm run prisma:migrate    # apply migrasi (buat/ubah tabel)
npm run prisma:seed       # buat akun awal (idempotent)
npm run prisma:studio     # (opsional) GUI lihat data di browser
```

### Akun hasil seed (development)

| Role  | Username | Password  |
|-------|----------|-----------|
| Owner | `owner`  | `owner123` |
| Kasir | `kasir`  | `kasir123` |

> Password disimpan sebagai hash bcrypt, bukan plaintext. Ganti kredensial ini
> sebelum dipakai di lingkungan nyata/production.

### Setup dari nol (jika pindah komputer / DB belum ada)

Jika PostgreSQL belum tersedia, install (mis. via installer resmi atau winget
`PostgreSQL.PostgreSQL.16`), buat database `pos_toko_bangunan`, set
`DATABASE_URL` di `backend/.env`, lalu jalankan `npm run prisma:migrate` dan
`npm run prisma:seed`.

---

## Struktur Proyek

```
Project Sistem Kasir/
├── backend/     # API server (Express + Prisma)
├── frontend/    # Web app (React + Vite + Tailwind)
├── .gitignore
└── README.md
```
