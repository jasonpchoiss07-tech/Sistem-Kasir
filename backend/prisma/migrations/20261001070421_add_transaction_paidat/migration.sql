-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "paidAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Transaction_paidAt_idx" ON "Transaction"("paidAt");

-- Backfill existing data: treat past transactions as paid at creation time,
-- except unpaid delivery orders which have not been paid yet (paidAt stays NULL).
UPDATE "Transaction" SET "paidAt" = "createdAt";
UPDATE "Transaction" t
   SET "paidAt" = NULL
  FROM "Shipment" s
 WHERE s."transactionId" = t."id"
   AND s."paymentStatus" = 'UNPAID';
