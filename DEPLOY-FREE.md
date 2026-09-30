# Deploy Gratis — Vercel + Render + Neon

Stack gratis untuk tahap coba. Semua env-driven, jadi nanti gampang pindah.

- Frontend  → **Vercel** (gratis)
- Backend   → **Render** (gratis; "tidur" setelah ~15 menit idle, request pertama lambat ±30–60s)
- Database  → **Neon** (Postgres gratis)
- Foto produk → lokal dulu (bisa ke-reset saat backend redeploy)

Butuh: akun **GitHub**, **Vercel**, **Render**, **Neon** (semua bisa login pakai GitHub).

---

## 1) Push ke GitHub
Buat repo kosong di github.com (mis. `pos-toko-bangunan`), lalu di folder project:

```powershell
git remote add origin https://github.com/<USERNAME>/pos-toko-bangunan.git
git push -u origin main
```

## 2) Database — Neon
1. Buka neon.tech → New Project (region terdekat, mis. Singapore).
2. Salin **connection string** (pilih yang "pooled" bila ada), bentuknya:
   `postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
3. Simpan — ini `DATABASE_URL`.

## 3) Backend — Koyeb (TANPA kartu kredit) ⭐ direkomendasikan
Render kini minta verifikasi kartu. Koyeb tidak — daftar cukup pakai GitHub, free tier
mendukung WebSocket + HTTPS otomatis.

1. Buka koyeb.com → Sign up **with GitHub** (tanpa kartu).
2. Create → **Web Service** → **GitHub** → pilih repo `pos-toko-bangunan`.
3. Builder: **Buildpack** (bukan Docker), lalu set:
   - **Work directory**: `backend`
   - **Build command**: `npm ci && npm run build && npx prisma generate`
   - **Run command**: `npx prisma migrate deploy && npm run start`
4. Instance: pilih **Free**. Region: terdekat (mis. Singapore/Frankfurt).
5. **Environment variables**:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = connection string Neon (langkah 2)
   - `JWT_SECRET` = teks acak panjang (mis. hasil `openssl rand -hex 32`)
   - `JWT_EXPIRES_IN` = `12h`
   - `STORE_NAME` = nama tokomu
   - `CORS_ORIGIN` = placeholder dulu (mis. `https://example.com`); diperbaiki di langkah 5
6. **Port / health check**: port `8000` (Koyeb set env `PORT` otomatis; app kita ikut `PORT`),
   health check path `/api/health`.
7. Deploy. Salin URL backend, mis. `https://pos-backend-xxxx.koyeb.app`.
   Cek `https://.../api/health` → `{"success":true,...}`.

> Catatan: `render.yaml` di repo hanya dipakai kalau suatu saat pindah ke Render — abaikan untuk Koyeb.

<details>
<summary>Alternatif backend tanpa kartu lainnya</summary>

- **Koyeb** (dipakai di atas) — paling mudah, WS didukung, tanpa kartu.
- **Railway** — mulus tapi setelah kredit trial biasanya minta kartu.
- **Google Cloud Run / Oracle Cloud** — gratis tapi butuh kartu untuk aktivasi billing.

</details>

## 3-LAMA) Backend — Render (butuh kartu — lewati bila tak mau)
1. Buka render.com → New → **Blueprint** → connect repo GitHub kamu.
   (Render membaca `render.yaml`, otomatis bikin service `pos-backend`.)
2. Saat diminta env vars, isi:
   - `DATABASE_URL` = connection string Neon (langkah 2)
   - `STORE_NAME`   = nama tokomu
   - `CORS_ORIGIN`  = isi placeholder dulu (mis. `https://example.com`); diperbaiki jadi URL Vercel di langkah 5. (Login dari frontend baru jalan setelah langkah 5.)
   - `JWT_SECRET`   = biarkan (Render generate otomatis)
3. Deploy. Setelah selesai, salin URL backend, mis. `https://pos-backend-xxxx.onrender.com`.
4. Cek `https://pos-backend-xxxx.onrender.com/api/health` → harus `{"success":true,...}`.

## 4) Frontend — Vercel
1. Buka vercel.com → Add New → Project → import repo GitHub.
2. **Root Directory**: pilih `frontend`.
3. Environment Variables → tambah:
   - `VITE_API_URL` = URL backend Render (langkah 3), TANPA garis miring akhir.
4. Deploy. Salin URL frontend, mis. `https://pos-toko-bangunan.vercel.app`.

## 5) Sambungkan CORS
1. Kembali ke Render → service `pos-backend` → Environment.
2. Set `CORS_ORIGIN` = URL Vercel (langkah 4), mis. `https://pos-toko-bangunan.vercel.app`.
3. Save → Render auto-redeploy.

## 6) Buat akun awal (seed)
Migrasi tabel sudah otomatis jalan saat backend start. Untuk membuat akun owner/kasir,
jalankan seed sekali dari komputer kamu, diarahkan ke Neon:

```powershell
cd backend
$env:DATABASE_URL="<connection string Neon>"
npm run prisma:seed
```
Akun default: `owner/owner123`, `kasir/kasir123`. **Ganti password sebelum dipakai nyata.**

## 7) Coba
Buka URL Vercel di HP/laptop mana pun → login. Selesai — satu link, banyak device.

---

## Pindah ke tempat lain nanti
Karena semua pakai env var, pindah provider = ganti `DATABASE_URL` (DB), `VITE_API_URL`
(frontend), `CORS_ORIGIN` (backend). Kode tidak berubah. Untuk foto permanen,
pasang object storage (Supabase Storage / Cloudflare R2) — perubahan kecil, bisa
ditambahkan saat dibutuhkan.

## Catatan
- Render free tidur saat idle → pagi buka toko, request pertama agak lambat lalu normal.
  Kalau mau tanpa jeda: upgrade Render (~$7/bln) atau pindah backend+DB ke Railway (~$5/bln).
- Neon free bisa auto-suspend; tersambung lagi otomatis saat ada request.
