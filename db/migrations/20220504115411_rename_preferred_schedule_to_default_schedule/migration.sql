/*
  Warnings:

  - You are about to drop the `PreferredSchedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PreferredSchedule" DROP CONSTRAINT "PreferredSchedule_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "PreferredSchedule" DROP CONSTRAINT "PreferredSchedule_userId_fkey";

-- DropTable
DROP TABLE "PreferredSchedule";

-- CreateTable
CREATE TABLE "DefaultSchedule" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "scheduleId" INTEGER NOT NULL,

    CONSTRAINT "DefaultSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DefaultSchedule_userId_key" ON "DefaultSchedule"("userId");

-- AddForeignKey
ALTER TABLE "DefaultSchedule" ADD CONSTRAINT "DefaultSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultSchedule" ADD CONSTRAINT "DefaultSchedule_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
