-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'KASIR');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BELI_LANGSUNG', 'PENGIRIMAN');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'UNPAID');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('MENUNGGU_DIKIRIM', 'SEDANG_DIKIRIM', 'SUDAH_DIKIRIM', 'DIBATALKAN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "edx" TEXT NOT NULL,
    "photoUrl" TEXT,
    "unit" TEXT NOT NULL,
    "sellPrice" DECIMAL(14,2) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "whatsapp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "trxNumber" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,
    "cashReceived" DECIMAL(14,2),
    "change" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cashierId" TEXT NOT NULL,
    "customerId" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionItem" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productNameSnapshot" TEXT NOT NULL,
    "unitSnapshot" TEXT NOT NULL,
    "sellPriceSnapshot" DECIMAL(14,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "returnedQty" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TransactionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "shipmentStatus" "ShipmentStatus" NOT NULL DEFAULT 'MENUNGGU_DIKIRIM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Return" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Return_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnItem" (
    "id" TEXT NOT NULL,
    "returnId" TEXT NOT NULL,
    "transactionItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "ReturnItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");

-- CreateIndex
CREATE INDEX "Product_edx_idx" ON "Product"("edx");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");

-- CreateIndex
CREATE INDEX "Customer_name_idx" ON "Customer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_trxNumber_key" ON "Transaction"("trxNumber");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "Transaction_cashierId_idx" ON "Transaction"("cashierId");

-- CreateIndex
CREATE INDEX "Transaction_customerId_idx" ON "Transaction"("customerId");

-- CreateIndex
CREATE INDEX "TransactionItem_transactionId_idx" ON "TransactionItem"("transactionId");

-- CreateIndex
CREATE INDEX "TransactionItem_productId_idx" ON "TransactionItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_transactionId_key" ON "Shipment"("transactionId");

-- CreateIndex
CREATE INDEX "Shipment_paymentStatus_idx" ON "Shipment"("paymentStatus");

-- CreateIndex
CREATE INDEX "Shipment_shipmentStatus_idx" ON "Shipment"("shipmentStatus");

-- CreateIndex
CREATE INDEX "Return_transactionId_idx" ON "Return"("transactionId");

-- CreateIndex
CREATE INDEX "Return_ownerId_idx" ON "Return"("ownerId");

-- CreateIndex
CREATE INDEX "Return_createdAt_idx" ON "Return"("createdAt");

-- CreateIndex
CREATE INDEX "ReturnItem_returnId_idx" ON "ReturnItem"("returnId");

-- CreateIndex
CREATE INDEX "ReturnItem_transactionItemId_idx" ON "ReturnItem"("transactionItemId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Return" ADD CONSTRAINT "Return_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "Return"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_transactionItemId_fkey" FOREIGN KEY ("transactionItemId") REFERENCES "TransactionItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─────────────────────────────────────────────────────────────
-- Business-rule CHECK constraints (enforced at the database level)
-- ─────────────────────────────────────────────────────────────

-- Rule 4: stock must never be negative; minimum stock cannot be negative.
ALTER TABLE "Product" ADD CONSTRAINT "Product_stock_nonneg_chk" CHECK ("stock" >= 0);
ALTER TABLE "Product" ADD CONSTRAINT "Product_minStock_nonneg_chk" CHECK ("minStock" >= 0);
-- Money must not be negative.
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellPrice_nonneg_chk" CHECK ("sellPrice" >= 0);

-- A sold line must have a positive quantity and non-negative money.
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_quantity_pos_chk" CHECK ("quantity" > 0);
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_sellPrice_nonneg_chk" CHECK ("sellPriceSnapshot" >= 0);
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_subtotal_nonneg_chk" CHECK ("subtotal" >= 0);
-- Rule 5: returned quantity must stay traceable within the sold quantity.
ALTER TABLE "TransactionItem" ADD CONSTRAINT "TransactionItem_returnedQty_range_chk" CHECK ("returnedQty" >= 0 AND "returnedQty" <= "quantity");

-- Transaction money must not be negative.
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_total_nonneg_chk" CHECK ("total" >= 0);
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_cashReceived_nonneg_chk" CHECK ("cashReceived" IS NULL OR "cashReceived" >= 0);
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_change_nonneg_chk" CHECK ("change" IS NULL OR "change" >= 0);

-- A returned line must have a positive quantity.
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_quantity_pos_chk" CHECK ("quantity" > 0);
