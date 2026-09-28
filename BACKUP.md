# Backup & Recovery — POS Toko Bangunan

The source of truth is the PostgreSQL database. The app does not store business
data anywhere else, so protecting the database protects everything (products,
stock, transactions, returns, customers, deliveries, audit log).

## 1. Development / local (portable PostgreSQL at `D:\pgtools`)

Manual snapshot (compressed custom-format dump):

```powershell
cd backend
npm run db:backup      # writes backend/backups/pos_YYYYMMDD_HHmmss.dump
```

Restore a snapshot (replaces existing objects — use with care):

```powershell
cd backend
npm run db:restore -- -File backups\pos_YYYYMMDD_HHmmss.dump
```

Notes:
- Dumps live in `backend/backups/` (git-ignored).
- Scripts use `pg_dump` / `pg_restore` from `D:\pgtools\pgsql\bin`. Adjust the
  `$pgBin` path in `scripts/backup.ps1` / `scripts/restore.ps1` if PostgreSQL
  is installed elsewhere.
- Keep copies off the machine (external drive / cloud folder) so a disk failure
  does not lose both the DB and its backups.

## 2. Production (recommended: managed PostgreSQL)

Use a managed provider (e.g. Supabase, Neon, Railway, RDS). These handle the
heavy lifting better than anything built into the app:

- **Automatic backups:** enable the provider's daily automated backups +
  point-in-time recovery (PITR) if available. Set retention (e.g. 7–30 days).
- **Manual/on-demand backup:** trigger a snapshot from the provider dashboard
  before risky operations (migrations, bulk edits). The same `pg_dump` command
  also works against the production `DATABASE_URL` for an extra offline copy:

  ```bash
  pg_dump "$DATABASE_URL" -F c -f pos_backup.dump
  ```

- **Owner manual backup:** for the owner, "manual backup" = trigger a snapshot
  in the provider dashboard (or run the `pg_dump` command above). We deliberately
  do NOT build a download-database button into the app — it is slower, less safe,
  and duplicates what the provider already does well.

## 3. Recovery procedure

1. Provision/verify the target PostgreSQL database and set `DATABASE_URL`.
2. Restore data:
   - Managed provider: restore the chosen automated backup / PITR timestamp from
     the dashboard, **or**
   - From a dump file: `pg_restore --clean --if-exists -d "$DATABASE_URL" pos_backup.dump`
3. Apply any pending schema migrations: `npm run prisma:migrate` (or
   `prisma migrate deploy` in production).
4. If starting from an empty database, seed the initial owner/kasir accounts:
   `npm run prisma:seed`.
5. Verify: log in, open Dashboard, check product stock and recent transactions.

## 4. What is protected

Everything is in PostgreSQL and covered by the above:
users, products, stock adjustments, transactions + items, customers, shipments,
returns, and the audit log.

Product images are stored as files under `backend/uploads/` (dev) — back these up
separately, or move to object storage in production (see deployment step).
