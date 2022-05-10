/*
  Warnings:

  - You are about to drop the `DefaultSchedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DefaultSchedule" DROP CONSTRAINT "DefaultSchedule_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "DefaultSchedule" DROP CONSTRAINT "DefaultSchedule_userId_fkey";

-- DropTable
DROP TABLE "DefaultSchedule";
