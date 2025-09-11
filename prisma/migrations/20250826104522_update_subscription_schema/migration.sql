
/*
  Warnings:

  - You are about to drop the column `isTrialActive` on the `cabinets` table. All the data in the column will be lost.
  - You are about to drop the column `maxPatients` on the `cabinets` table. All the data in the column will be lost.
  - You are about to drop the column `trialEndDate` on the `cabinets` table. All the data in the column will be lost.
  - You are about to drop the column `trialStartDate` on the `cabinets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cabinets" DROP COLUMN "isTrialActive",
DROP COLUMN "maxPatients",
DROP COLUMN "trialEndDate",
DROP COLUMN "trialStartDate";

-- AlterTable
ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DEFAULT 'TRIALING';
