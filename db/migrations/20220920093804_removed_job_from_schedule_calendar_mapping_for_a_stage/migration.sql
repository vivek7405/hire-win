/*
  Warnings:

  - You are about to drop the `JobUserScheduleCalendar` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "JobUserScheduleCalendar" DROP CONSTRAINT "JobUserScheduleCalendar_calendarId_fkey";

-- DropForeignKey
ALTER TABLE "JobUserScheduleCalendar" DROP CONSTRAINT "JobUserScheduleCalendar_jobId_fkey";

-- DropForeignKey
ALTER TABLE "JobUserScheduleCalendar" DROP CONSTRAINT "JobUserScheduleCalendar_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "JobUserScheduleCalendar" DROP CONSTRAINT "JobUserScheduleCalendar_stageId_fkey";

-- DropForeignKey
ALTER TABLE "JobUserScheduleCalendar" DROP CONSTRAINT "JobUserScheduleCalendar_userId_fkey";

-- DropTable
DROP TABLE "JobUserScheduleCalendar";

-- CreateTable
CREATE TABLE "StageUserScheduleCalendar" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "calendarId" TEXT,
    "stageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StageUserScheduleCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StageUserScheduleCalendar_stageId_userId_key" ON "StageUserScheduleCalendar"("stageId", "userId");

-- AddForeignKey
ALTER TABLE "StageUserScheduleCalendar" ADD CONSTRAINT "StageUserScheduleCalendar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageUserScheduleCalendar" ADD CONSTRAINT "StageUserScheduleCalendar_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageUserScheduleCalendar" ADD CONSTRAINT "StageUserScheduleCalendar_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageUserScheduleCalendar" ADD CONSTRAINT "StageUserScheduleCalendar_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
