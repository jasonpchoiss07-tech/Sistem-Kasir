# Deployment — POS Toko Bangunan

Goal: one centralized production database + a backend API + a frontend, reachable
from the cashier PC, owner laptop, and owner phone/tablet over HTTPS.

```
   Cashier PC / Owner laptop / Owner phone   (browser / installed PWA)
                        │  HTTPS
              ┌─────────┴─────────┐
              ▼                   ▼
   Frontend (static SPA)   Backend API + Socket.IO
   e.g. app.namatoko.com   e.g. api.namatoko.com
                                 │
                                 ▼
                    Managed PostgreSQL (cloud)
```

> The local `D:\pgtools` PostgreSQL is **development only**. Production must use a
> separate managed database.

---

## 0. Decisions required before deploying

These need YOUR input (accounts/credentials/choices) — see the "Decisions" section
at the bottom. Nothing below can be executed without them.

## 1. Production database (managed PostgreSQL)

Pick a managed provider (Supabase / Neon / Railway / RDS). Create a database and
copy its connection string → this becomes `DATABASE_URL` (often needs
`?sslmode=require`).

Apply schema + seed the first accounts:

```bash
# with DATABASE_URL pointed at the production DB
cd backend
npx prisma migrate deploy      # creates all tables (no data loss, no dev reset)
npm run prisma:seed            # creates owner/kasir — CHANGE these credentials after
```

Enable the provider's **automatic daily backups / PITR** (see BACKUP.md).

## 2. Backend (API) — env vars

Set these on the backend host (never commit real values). Template:
`backend/.env.production.example`.

| Var | Example | Notes |
|-----|---------|-------|
| `NODE_ENV` | `production` | enables secret guard + error masking |
| `PORT` | `4000` | or provider-assigned |
| `DATABASE_URL` | `postgresql://…?sslmode=require` | managed DB |
| `JWT_SECRET` | 64-hex random | `openssl rand -hex 32`; server refuses to boot if default |
| `JWT_EXPIRES_IN` | `12h` | |
| `CORS_ORIGIN` | `https://app.namatoko.com` | the frontend origin(s), comma-separated |
| `STORE_NAME` | `Toko Bangunan Jaya` | printed on receipts |

Deploy option A — provider that runs Node (Railway/Render/Fly):
- Build command: `npm ci && npm run build`
- Start command: `npx prisma migrate deploy && npm run start`

Deploy option B — Docker (`backend/Dockerfile`): image runs `migrate deploy`
then `node dist/server.js` automatically.

## 3. Frontend (static SPA) — env vars

Vite bakes env at **build time**, so `VITE_API_URL` must be set before building.
Template: `frontend/.env.production.example`.

| Var | Example | Notes |
|-----|---------|-------|
| `VITE_API_URL` | `https://api.namatoko.com` | backend origin, NO trailing slash, NO `/api` |

Deploy option A — static host (Vercel/Netlify/Cloudflare Pages):
- Build: `npm ci && npm run build` → output dir `dist`
- Set `VITE_API_URL` in the host's build env.

Deploy option B — Docker (`frontend/Dockerfile` + `nginx.conf`):
- Build with `--build-arg VITE_API_URL=https://api.namatoko.com`
- Serves the SPA on port 80 with history fallback.

## 4. HTTPS & CORS

- Frontend and backend should each be served over HTTPS (managed hosts do this
  automatically; for a VPS use a reverse proxy like Caddy/Nginx + Let's Encrypt).
- `CORS_ORIGIN` on the backend must list the exact frontend origin(s). Socket.IO
  uses the same allowlist.

## 5. Product images (uploads)

Local `backend/uploads` is **ephemeral** on most hosts (wiped on redeploy). For
durable images move to object storage (Supabase Storage / S3 / Cloudflare R2)
and store the returned URL in `Product.photoUrl` (the frontend already renders
absolute URLs). Until then, images work but may reset on redeploy.

> This is the one remaining code change if durable images are required; flag it
> and it can be added without touching other features.

## 6. Post-deploy verification checklist

1. Owner login works on `app.namatoko.com`.
2. Cashier login works.
3. Products load (images visible).
4. Cashier completes a checkout; change is correct.
5. Stock decreases; dashboard reflects it (realtime).
6. Transaction appears in history; receipt prints/reprints.
7. Owner opens dashboard.
8. Owner opens the app from a phone (different device) and logs in.
9. Return restores stock; original transaction preserved.
10. Delivery status updates.
11. Data persists after a backend redeploy (managed DB keeps data).
12. Run a manual backup + confirm a restore into a scratch DB (BACKUP.md).

---

## Decisions required from owner

1. **Hosting providers** — which one for each?
   - Database: Supabase / Neon / Railway / RDS / other
   - Backend: Railway / Render / Fly / VPS / other
   - Frontend: Vercel / Netlify / Cloudflare Pages / same VPS / other
2. **Domain** — do you have one (e.g. `namatoko.com`)? Preferred subdomains for
   app + api? If no domain, we can use the providers' default URLs.
3. **Product images** — keep local uploads for now (reset on redeploy) or set up
   object storage now?
4. **Seed credentials** — confirm the initial owner/kasir usernames+passwords to
   create in production (must differ from the dev `owner123`/`kasir123`).

Once these are decided, the app is ready to deploy with the steps above — no code
changes required (except optional object storage for images).
