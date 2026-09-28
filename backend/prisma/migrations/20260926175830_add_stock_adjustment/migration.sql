-- CreateEnum
CREATE TYPE "StockAdjustmentType" AS ENUM ('STOCK_IN', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "StockAdjustment" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "type" "StockAdjustmentType" NOT NULL,
    "quantityChange" INTEGER NOT NULL,
    "resultingStock" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockAdjustment_productId_idx" ON "StockAdjustment"("productId");

-- CreateIndex
CREATE INDEX "StockAdjustment_userId_idx" ON "StockAdjustment"("userId");

-- CreateIndex
CREATE INDEX "StockAdjustment_createdAt_idx" ON "StockAdjustment"("createdAt");

-- AddForeignKey
ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Business rule: resulting stock after any adjustment must never be negative.
ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_resultingStock_nonneg_chk" CHECK ("resultingStock" >= 0);
