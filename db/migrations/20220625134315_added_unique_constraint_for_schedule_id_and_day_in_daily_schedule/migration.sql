/*
  Warnings:

  - A unique constraint covering the columns `[scheduleId,day]` on the table `DailySchedule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DailySchedule_scheduleId_day_key" ON "DailySchedule"("scheduleId", "day");
