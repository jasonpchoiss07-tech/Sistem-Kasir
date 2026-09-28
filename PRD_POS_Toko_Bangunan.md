# PRD — POS Toko Bangunan

**Product Requirements Document**

**Version:** 1.0  
**Status:** Draft / Pre-Development  
**Product:** Point of Sale (POS) Toko Bangunan  
**Platform:** Web Application + PWA

\---

# 1\. Product Overview

## 1.1 Product Name

**POS Toko Bangunan**

Nama toko dapat dikonfigurasi kemudian.

## 1.2 Product Description

POS Toko Bangunan adalah sistem kasir berbasis web yang digunakan untuk mengelola proses penjualan, produk, stok, transaksi, pelanggan, pengiriman, retur, dan monitoring penjualan.

Sistem dirancang agar dapat digunakan oleh **Owner** dan **Kasir** dengan hak akses yang berbeda.

Sistem menggunakan satu database pusat sehingga data dari PC, laptop, smartphone, dan tablet tetap tersinkronisasi. Sistem juga dirancang agar dapat diakses melalui internet, digunakan sebagai PWA, serta terhubung dengan thermal printer untuk mencetak struk.

\---

# 2\. Product Goals

Tujuan utama sistem:

1. Mempermudah proses transaksi penjualan.
2. Mempermudah kasir mencari dan memilih produk.
3. Menjaga stok agar selalu konsisten.
4. Menyimpan seluruh history transaksi secara permanen.
5. Memberikan Owner kontrol penuh terhadap operasional toko.
6. Memisahkan hak akses Owner dan Kasir.
7. Memungkinkan monitoring penjualan dan stok.
8. Mendukung transaksi beli langsung dan transaksi pengiriman.
9. Mendukung proses retur barang.
10. Menyediakan sinkronisasi data antar-device secara realtime.
11. Dapat digunakan dari berbagai perangkat.
12. Dapat di-install sebagai PWA.
13. Mendukung pencetakan dan pencetakan ulang struk.

\---

# 3\. Target Users

## 3.1 Owner

Owner adalah pengguna dengan akses penuh terhadap sistem.

Owner dapat:

* Melihat dashboard.
* Melihat penjualan.
* Melihat history transaksi.
* Melihat detail transaksi.
* Melakukan retur.
* Mengelola produk.
* Mengelola stok.
* Melihat harga modal.
* Melihat harga jual.
* Mengelola pelanggan.
* Melihat pengiriman.
* Melihat laporan.
* Melakukan backup/data management.
* Mengelola akun Kasir.

## 3.2 Kasir

Kasir digunakan untuk menjalankan aktivitas penjualan sehari-hari.

Kasir dapat:

* Login.
* Melihat produk.
* Search produk.
* Melihat foto produk.
* Melihat nama produk.
* Melihat EDX.
* Melihat harga jual.
* Melihat stok.
* Menambahkan produk ke keranjang.
* Mengubah jumlah produk.
* Checkout.
* Menerima pembayaran cash.
* Mencetak struk.

Kasir tidak dapat:

* Mengubah harga.
* Mengubah stok.
* Menghapus transaksi.
* Mengakses pengaturan Owner.
* Melihat informasi keuangan sensitif.

\---

# 4\. Product Scope

Sistem akan menangani produk toko bangunan.

Setiap produk minimal memiliki:

* ID
* Foto
* Nama
* EDX / kode internal
* Satuan
* Harga Modal
* Harga Jual
* Stok
* Stok Minimum

Contoh:

**Semen Tiga Roda — EDX**  
**Rp65.000 / Sak**  
**Stok: 50**

EDX dapat ditampilkan kepada Owner dan Kasir.

Namun EDX dan harga modal **tidak boleh ditampilkan pada struk pelanggan**.

\---

# 5\. Product Unit

Karena sistem digunakan untuk toko bangunan, produk harus mendukung satuan yang fleksibel.

Contoh:

* Sak
* Batang
* Kg
* Meter
* Dus
* Pcs
* Liter
* dan satuan lain.

Konversi satuan seperti `1 Dus = 12 Pcs` belum menjadi fitur wajib pada versi awal dan akan ditentukan kemudian jika diperlukan.

\---

# 6\. Inventory / Stock

Stock merupakan bagian inti dari sistem.

## Rules

### Stock tidak boleh negatif.

Contoh:

Stock = 5  
Customer membeli = 6

Hasil:

**Checkout ditolak.**

Sistem menampilkan:

> Stok tidak mencukupi. Tersedia: 5

Stock hanya berkurang setelah transaksi berhasil.

Retur akan mengembalikan stock.

\---

# 7\. Cashier / POS Flow

Halaman kasir menampilkan produk dalam bentuk card atau list.

Flow utama:

```text
Search
   ↓
Pilih Produk
   ↓
Tambah ke Keranjang
   ↓
Atur Jumlah
   ↓
Checkout
```

\---

# 8\. Transaction Types

Sistem memiliki dua tipe transaksi.

## 8.1 Beli Langsung

Customer datang langsung ke toko dan membawa barang sendiri.

Customer tidak wajib diinput.

Flow:

```text
Beli Langsung
      ↓
Produk
      ↓
Keranjang
      ↓
Cash
      ↓
Checkout
      ↓
Struk
```

## 8.2 Pesan + Kirim

Customer meminta barang dikirim.

Data customer:

* Nama → Required
* Alamat → Required
* WhatsApp → Optional

Kemudian:

* Barang
* Jumlah

\---

# 9\. Payment

Versi awal sistem hanya mendukung:

**Cash**

Contoh:

Total: Rp190.000  
Cash: Rp200.000  
Change: Rp10.000

Jika Cash < Total:

**Checkout ditolak.**

\---

# 10\. Delivery

Untuk transaksi `Pesan + Kirim`, sistem menyimpan status pembayaran.

## Payment Status

* PAID
* UNPAID

## Shipment Status

* MENUNGGU DIKIRIM
* SEDANG DIKIRIM
* SUDAH DIKIRIM
* DIBATALKAN

\---

# 11\. Transaction Number

Setiap transaksi berhasil harus mempunyai nomor transaksi unik.

Contoh:

`TRX-20260826-0001`

Nomor transaksi harus:

* Unik
* Tidak berubah
* Tidak digunakan ulang
* Tetap tersimpan dalam history
* Dapat digunakan sebagai referensi retur

\---

# 12\. Receipt

Setiap checkout menghasilkan receipt.

Receipt berisi:

* Nama toko
* Nomor transaksi
* Tanggal
* Jam
* Kasir
* Customer (hanya jika pengiriman)
* Barang
* Jumlah
* Satuan
* Harga jual
* Subtotal
* Total
* Cash
* Kembalian

Receipt tidak boleh berisi:

* EDX
* Harga modal
* Informasi internal lainnya

Receipt dapat:

1. Dicetak setelah checkout.
2. Dicetak ulang melalui history.

\---

# 13\. Transaction History

Setiap transaksi yang berhasil harus disimpan secara permanen.

History tidak boleh hilang ketika:

* User logout.
* Aplikasi ditutup.
* Komputer restart.
* Hari berganti.

Owner dapat melakukan pencarian berdasarkan:

* Hari ini
* Kemarin
* Minggu lalu
* Bulan lalu
* Rentang tanggal
* Nomor transaksi

History dibagi menjadi:

* Beli Langsung
* Pengiriman

\---

# 14\. Return / Retur

Retur dilakukan oleh Owner melalui history transaksi.

Flow:

```text
History
   ↓
Pilih Transaksi
   ↓
Retur
   ↓
Pilih Barang
   ↓
Jumlah Retur
   ↓
Confirm
```

Contoh:

Original: Semen × 5  
Return: Semen × 2

Maka stock bertambah 2.

Transaksi original **tidak dihapus**.

Sistem menyimpan:

* Barang
* Jumlah
* Waktu retur
* Owner yang melakukan retur

\---

# 15\. Customer

Customer management dibuat sederhana.

Data customer:

* Customer ID
* Nama
* Alamat
* No. WhatsApp

Tidak diperlukan CRM kompleks pada versi awal.

Rules:

### Beli Langsung

Tidak perlu memasukkan customer.

### Pengiriman

* Nama + Alamat = Required
* WhatsApp = Optional

\---

# 16\. Owner Dashboard

Dashboard Owner menyediakan overview operasional toko.

## Sales

Menampilkan:

* Penjualan hari ini
* Jumlah transaksi
* Barang terjual
* Penjualan 7 hari
* Penjualan bulanan

## Products

Menampilkan:

* Semua produk
* Stok
* Harga modal
* Harga jual
* Produk dengan stok menipis

## History

Menampilkan:

* Semua transaksi
* Detail receipt
* Retur
* Pengiriman

## Customers

Menampilkan:

* Data pelanggan
* Riwayat pembelian

\---

# 17\. Realtime Synchronization

Sistem harus mendukung sinkronisasi data realtime.

Contoh:

```text
Stock = 50

Kasir checkout:
Semen × 2

        ↓

Stock = 48
```

Owner yang sedang membuka dashboard dapat langsung melihat stock terbaru tanpa refresh manual.

Penjualan juga dapat langsung muncul pada dashboard Owner.

\---

# 18\. Multi-Device

Sistem menggunakan satu database pusat.

```text
                 CLOUD
                   │
              PostgreSQL
                   │
                Backend
                   │
       ┌───────────┼───────────┐
       ↓           ↓           ↓
      PC          HP         Tablet
    Kasir        Owner
```

Semua device menggunakan sistem yang sama dan membaca data yang sama.

\---

# 19\. PWA

Aplikasi harus dibuat sebagai:

**Progressive Web App (PWA)**

Sehingga dapat di-install seperti aplikasi.

Target:

* Android
* iPhone
* Tablet
* Laptop
* Desktop

Satu codebase digunakan untuk seluruh device.

\---

# 20\. Responsive UI

UI menggunakan pendekatan:

**Mobile-first + Responsive**

Target:

* Mobile
* Tablet
* Laptop
* Desktop

Layout harus beradaptasi terhadap ukuran layar, bukan hanya mengecilkan tampilan desktop.

\---

# 21\. Thermal Printer

Sistem harus mendukung pencetakan receipt menggunakan thermal printer.

Flow:

```text
Web App
   ↓
Print Mechanism
   ↓
Thermal Printer
```

Fitur:

* Cetak Struk
* Cetak Ulang

Jenis koneksi printer seperti USB/LAN akan ditentukan berdasarkan printer yang digunakan.

\---

# 22\. Data \& Persistence

Data utama berada di cloud.

Database utama menggunakan:

**PostgreSQL**

Sistem tidak bergantung pada penyimpanan PC kasir untuk data transaksi utama.

\---

# 23\. Backup \& Recovery

Sistem harus menyediakan mekanisme backup.

Minimal:

* Automatic Backup
* Manual Backup oleh Owner

Tujuannya memastikan data dapat dipulihkan apabila terjadi masalah pada database/server.

\---

# 24\. Security Requirements

Sistem harus menerapkan:

* Authentication
* Role-based access
* Permission checking
* Password hashing
* Secure handling of sensitive information
* Backend authorization

Password tidak boleh disimpan sebagai plaintext.

Informasi seperti harga modal harus dibatasi berdasarkan role.

\---

# 25\. File Storage

Foto produk tidak disimpan sebagai file besar langsung di database.

Arsitektur:

```text
Product Image
      ↓
Object / Cloud Storage
      ↓
image reference / URL
      ↓
PostgreSQL
```

Database hanya menyimpan referensi terhadap file gambar.

\---

# 26\. Technology Stack

## Frontend

* React
* TypeScript
* Tailwind CSS

## Backend

* Node.js
* TypeScript
* Express.js

## ORM

* Prisma

## Database

* PostgreSQL

## Authentication

* JWT
* Password Hashing
* Role \& Permission

## Realtime

* WebSocket / Socket.IO

## Storage

* Object / Cloud Storage

## Application

* PWA

## Development

* Git
* GitHub
* Postman

\---

# 27\. Development Environment

Development dilakukan terlebih dahulu secara lokal.

```text
Developer Laptop
      │
      ├── React
      ├── Node.js
      └── PostgreSQL
```

Semua fitur harus dibangun dan dites terlebih dahulu sebelum deployment production.

Production menggunakan cloud dengan:

* Frontend
* Backend
* PostgreSQL
* HTTPS

Sistem dapat diakses melalui internet dari PC, HP, dan tablet.

\---

# 28\. Out of Scope — Version 1

Fitur berikut belum menjadi bagian dari V1:

* Payment gateway
* QRIS
* E-wallet
* Credit card
* CRM kompleks
* Mobile app native terpisah
* Android app terpisah
* iOS app terpisah
* Unit conversion kompleks
* Fitur baru yang belum disetujui

AI tidak boleh menambahkan fitur besar hanya karena dianggap bagus tanpa persetujuan.

\---

# 29\. Success Criteria

## Authentication

* Owner dapat login.
* Kasir dapat login.
* Role bekerja dengan benar.

## Product

* Owner dapat mengelola produk.
* Kasir dapat melihat produk.
* Produk memiliki stok dan harga.

## POS

* Kasir dapat mencari produk.
* Kasir dapat memasukkan produk ke cart.
* Kasir dapat checkout.
* Cash dihitung dengan benar.
* Stok tidak dapat menjadi negatif.

## Transaction

* Transaksi tersimpan.
* Nomor transaksi unik.
* History dapat dicari.
* Receipt dapat dibuat.

## Return

* Owner dapat melakukan retur.
* Stok kembali.
* Transaksi asli tetap ada.
* History retur tersimpan.

## Delivery

* Customer dapat disimpan.
* Status pembayaran dapat disimpan.
* Status pengiriman dapat diperbarui.

## Dashboard

* Owner dapat melihat penjualan.
* Owner dapat melihat stok.
* Owner dapat melihat transaksi.

## System

* Data tersinkronisasi.
* Sistem responsive.
* Sistem dapat digunakan sebagai PWA.
* Backup tersedia.
* Receipt dapat dicetak/reprint.

\---

# 30\. Product Flow

```text
                         LOGIN
                           │
                ┌──────────┴──────────┐
                ↓                     ↓
             OWNER                  KASIR
                │                     │
        ┌───────┼───────┐             ↓
        ↓       ↓       ↓          PRODUCTS
    Dashboard Products History          │
        │       │       │               ↓
        │       │     Return           CART
        │       │                       │
        │       │                    CHECKOUT
        │       │                       │
        │       │                      CASH
        │       │                       │
        │       │                       ↓
        │       │                  TRANSACTION
        │       │                       │
        │       └───────────────┐       ↓
        │                       │     RECEIPT
        ↓                       ↓
    REPORTS                 HISTORY
                                │
                         ┌──────┴──────┐
                         ↓             ↓
                      RETURN       DELIVERY
```

\---

# 31\. High-Level System Architecture

```text
                         USERS
                           │
            ┌──────────────┴──────────────┐
            │                             │
         OWNER                         CASHIER
            │                             │
            └──────────────┬──────────────┘
                           ↓
                   React + TypeScript
                           │
                     PWA / Browser
                           │
                        HTTPS
                           │
                           ↓
                 Node.js + Express
                           │
              ┌────────────┼────────────┐
              ↓            ↓            ↓
         Authentication  Business    Realtime
                         Logic       Socket.IO
              │            │
              └──────┬─────┘
                     ↓
                   Prisma
                     ↓
                PostgreSQL
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
     Transaction            Product
     Customer               Stock
     Return                 User
     Shipment               History
```

\---

# 32\. Product Principle

Prinsip utama development:

> \\\*\\\*Build what is required, not what is assumed.\\\*\\\*

AI developer harus:

1. Mengikuti PRD.
2. Mengikuti requirements.
3. Mengikuti business rules.
4. Tidak mengubah architecture tanpa persetujuan.
5. Tidak mengganti technology stack tanpa persetujuan.
6. Tidak menambahkan fitur besar tanpa persetujuan.
7. Tidak membuat business logic penting hanya di frontend.
8. Memastikan authorization dilakukan di backend.
9. Menjaga data transaksi tetap konsisten.
10. Memastikan seluruh perubahan penting dapat ditelusuri.

\---

# 33\. MVP Development Priority

```text
P0 — CORE
Authentication
Role \\\& Permission
Product
Stock
Cart
Checkout
Transaction
History

P1 — OPERATIONS
Customer
Delivery
Return
Receipt
Owner Dashboard

P2 — SYSTEM
Realtime
PWA
Responsive
Thermal Printer
Backup
Security Hardening

P3 — FUTURE
Additional payment methods
Unit conversion
Additional integrations
Advanced reporting
```

\---

# 34\. Final Product Definition

**POS Toko Bangunan** adalah sebuah **web-based Point of Sale system** dengan dua role utama, yaitu Owner dan Kasir. Sistem menangani produk, stok, transaksi beli langsung, transaksi pengiriman, pembayaran cash, receipt, history, retur, pelanggan, pengiriman, dashboard, realtime synchronization, PWA, dan thermal printing.

Arsitektur utama:

```text
React + TypeScript
        ↓
Node.js + Express
        ↓
Prisma
        ↓
PostgreSQL
```

Dengan tambahan:

```text
Tailwind CSS
JWT
Password Hashing
Role \\\& Permission
Socket.IO
Cloud Storage
PWA
Thermal Printer
Git/GitHub
```

Sistem dikembangkan secara lokal terlebih dahulu, kemudian dipindahkan ke cloud production setelah seluruh fitur utama selesai diuji.

\---

# 

