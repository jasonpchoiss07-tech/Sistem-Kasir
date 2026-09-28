# Restore a POS Toko Bangunan database dump (development / local PostgreSQL).
#
# Usage (from the backend/ folder):
#   powershell -ExecutionPolicy Bypass -File scripts/restore.ps1 -File backups\pos_YYYYMMDD_HHmmss.dump
#
# WARNING: --clean drops existing objects before restoring. Make sure you are
# restoring into the intended database.

param(
  [Parameter(Mandatory = $true)][string]$File
)

$ErrorActionPreference = 'Stop'

$pgBin = 'D:\pgtools\pgsql\bin'
$dbUser = 'postgres'
$dbHost = '127.0.0.1'
$dbPort = '5432'
$dbName = 'pos_toko_bangunan'

if (-not (Test-Path $File)) {
  throw "Backup file not found: $File"
}

Write-Host "Restoring $File -> '$dbName' (existing objects will be replaced)"
& "$pgBin\pg_restore.exe" -U $dbUser -h $dbHost -p $dbPort -d $dbName --clean --if-exists $File
Write-Host "Restore complete."
