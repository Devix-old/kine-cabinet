/*
  Warnings:

  - You are about to drop the column `durationDays` on the `plans` table. All the data in the column will be lost.
  - You are about to drop the `webhook_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "cin" TEXT;

-- AlterTable
ALTER TABLE "plans" DROP COLUMN "durationDays";

-- DropTable
DROP TABLE "webhook_logs";
