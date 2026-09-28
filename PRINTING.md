# Thermal Printing — POS Toko Bangunan

## Current state (no printer hardware yet)

The app is prepared for thermal receipts without assuming a specific printer:

- **Receipt content is separated from the print mechanism.**
  - `ReceiptDocument` (`frontend/src/features/pos/ReceiptDocument.tsx`) renders
    the receipt content only, formatted for thermal paper (58–80mm, monospace).
    It contains exactly the PRD receipt fields: store name, transaction number,
    date/time, cashier, customer (delivery only), items (qty, unit, unit price,
    subtotal), total, cash, change. It never shows EDX or cost price.
  - `ReceiptView` is the *mechanism* wrapper (modal + print button).
- **Print & reprint** both work today via the browser print dialog:
  - Print right after checkout (POS).
  - Reprint from Riwayat Transaksi → detail → "Cetak Ulang".
- **Print CSS** (`frontend/src/styles/index.css`) isolates `.receipt-print`,
  sets `@page size: 80mm auto`, width ~72mm, monospace — so a thermal printer set
  as the print target produces a proper receipt.

This browser-print path is the fallback and works with most thermal printers that
have a Windows driver (USB or LAN) by choosing the printer in the print dialog.

## Information needed before wiring a real printer

When a printer is purchased, provide these so we can finalize integration:

1. **Printer model / brand** (e.g. Epson TM-T82, Xprinter XP-58).
2. **Paper width**: 58mm or 80mm.
3. **Connection type**: USB, LAN/Ethernet (IP), Bluetooth, or Serial.
4. **Driver availability**: does it install as a normal Windows printer? If yes,
   the current browser-print path already works.
5. **Whether direct ESC/POS is required** (e.g. cash-drawer kick, auto-cut,
   logo, no print dialog). If yes, we add an ESC/POS path:
   - USB/Serial or LAN → a small local print helper/agent, or
   - WebUSB/Web Serial (Chrome) for direct browser-to-printer, or
   - a print service on the cashier PC that accepts the receipt payload.

## Recommended default

For a single cashier PC on Windows, the simplest reliable setup is a thermal
printer with a Windows driver + the existing browser print (set the thermal
printer as default, disable margins/headers). ESC/POS is only needed for
auto-cut / cash drawer / no-dialog printing, which we can add later once the
model and connection are known.
