# Deploy ke Vercel (gratis, URL permanen)

Arsitektur: **2 project Vercel dari repo yang sama** + **Supabase** (database + storage foto).

```
User (HP/laptop) → Frontend (Vercel, statis) → Backend (Vercel serverless) → Supabase (Postgres + Storage)
```

Realtime dimatikan di produksi (refresh manual). Semua fitur lain jalan.

---

## A. Supabase Storage (foto produk)
1. Supabase → **Storage** → **New bucket** → nama `product-photos` → centang **Public bucket** → Create.
2. Ambil kredензial: Supabase → **Project Settings → API**:
   - **Project URL** → `SUPABASE_URL` (mis. `https://nlddibifzimramamtter.supabase.co`)
   - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

## B. Backend (Vercel — project #1)
1. vercel.com → **Add New → Project** → import repo **Sistem-Kasir**.
2. **Root Directory: `backend`**. Framework Preset: **Other** (ada `vercel.json`).
3. **Environment Variables**:
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | pooler **transaksi** (:6543): `postgresql://postgres.nlddibifzimramamtter:Jasonpc161207@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` |
   | `JWT_SECRET` | teks acak panjang |
   | `JWT_EXPIRES_IN` | `12h` |
   | `STORE_NAME` | nama tokomu |
   | `CORS_ORIGIN` | isi `https://example.com` dulu (diganti di langkah D) |
   | `SUPABASE_URL` | dari langkah A |
   | `SUPABASE_SERVICE_ROLE_KEY` | dari langkah A |
   | `SUPABASE_STORAGE_BUCKET` | `product-photos` |
4. **Deploy** → salin URL backend (mis. `https://sistem-kasir-backend.vercel.app`).
5. Tes: buka `https://<backend>/api/health` → harus `{"success":true,...}`.

> Catatan: migrasi tabel dijalankan dari lokal (pooler **session** :5432) — sudah dilakukan. Runtime Vercel pakai pooler **transaksi** :6543. Kalau nanti ubah skema, jalankan lagi `npx prisma migrate deploy` dari lokal (pakai :5432).

## C. Frontend (Vercel — project #2)
1. **Add New → Project** → import repo **Sistem-Kasir** lagi (project kedua).
2. **Root Directory: `frontend`**. Framework: **Vite** (otomatis).
3. **Environment Variables**:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | URL backend dari B4 (tanpa `/` di akhir, tanpa `/api`) |
4. **Deploy** → salin URL frontend (mis. `https://sistem-kasir.vercel.app`).

## D. Sambungkan CORS
1. Buka **project backend** → Settings → Environment Variables → ubah `CORS_ORIGIN` = URL frontend (langkah C4).
2. **Redeploy** project backend (Deployments → Redeploy).

## E. Selesai — tes
Buka URL frontend di HP/laptop mana pun → login `owner`/`owner123` (ganti password nanti). Coba tambah produk + upload foto (foto tersimpan di Supabase Storage), lalu transaksi.

---

## Kenapa ini tidak "mati"
- Vercel: URL permanen, tidak expire (beda dari Back4App free).
- Serverless "tidur" saat idle tapi bangun otomatis ~1–3 detik saat diakses — tidak perlu redeploy manual.
- Data aman di Supabase (Postgres + Storage).

## Kalau mau realtime lagi (nanti)
Pindahkan backend ke host persisten (Railway/VPS) dan set `VITE_REALTIME=on` di frontend. Kode sudah env-driven, tidak perlu perubahan besar.
