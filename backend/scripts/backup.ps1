# Manual database backup for POS Toko Bangunan (development / local PostgreSQL).
# Creates a compressed custom-format dump in backend/backups/.
#
# Usage (from the backend/ folder):
#   powershell -ExecutionPolicy Bypass -File scripts/backup.ps1
#
# For production, prefer the managed database provider's automatic backups
# (see BACKUP.md) — this script is mainly for local/dev snapshots.

$ErrorActionPreference = 'Stop'

# Adjust if your PostgreSQL bin path differs.
$pgBin = 'D:\pgtools\pgsql\bin'
$dbUser = 'postgres'
$dbHost = '127.0.0.1'
$dbPort = '5432'
$dbName = 'pos_toko_bangunan'

$backupDir = Join-Path $PSScriptRoot '..\backups'
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$outFile = Join-Path $backupDir "pos_$stamp.dump"

Write-Host "Backing up '$dbName' -> $outFile"
& "$pgBin\pg_dump.exe" -U $dbUser -h $dbHost -p $dbPort -d $dbName -F c -f $outFile
Write-Host "Backup complete: $outFile"
