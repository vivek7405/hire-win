/*
  Warnings:

  - You are about to drop the column `updatedByUserId` on the `Job` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_updatedByUserId_fkey";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "updatedByUserId";
