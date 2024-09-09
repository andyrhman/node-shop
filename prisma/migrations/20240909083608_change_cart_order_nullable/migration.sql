-- DropForeignKey
ALTER TABLE "carts" DROP CONSTRAINT "carts_order_id_fkey";

-- AlterTable
ALTER TABLE "carts" ALTER COLUMN "order_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
