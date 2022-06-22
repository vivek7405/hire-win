/*
  Warnings:

  - You are about to drop the column `calendarId` on the `InterviewDetail` table. All the data in the column will be lost.
  - You are about to drop the column `scheduleId` on the `InterviewDetail` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "InterviewDetail" DROP CONSTRAINT "InterviewDetail_calendarId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewDetail" DROP CONSTRAINT "InterviewDetail_scheduleId_fkey";

-- AlterTable
ALTER TABLE "InterviewDetail" DROP COLUMN "calendarId",
DROP COLUMN "scheduleId";

-- CreateTable
CREATE TABLE "JobUserScheduleCalendar" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "scheduleId" INTEGER NOT NULL,
    "calendarId" INTEGER,
    "userId" INTEGER NOT NULL,
    "jobId" TEXT NOT NULL,
    "workflowStageId" TEXT NOT NULL,

    CONSTRAINT "JobUserScheduleCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobUserScheduleCalendar_jobId_workflowStageId_userId_key" ON "JobUserScheduleCalendar"("jobId", "workflowStageId", "userId");

-- AddForeignKey
ALTER TABLE "JobUserScheduleCalendar" ADD CONSTRAINT "JobUserScheduleCalendar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobUserScheduleCalendar" ADD CONSTRAINT "JobUserScheduleCalendar_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobUserScheduleCalendar" ADD CONSTRAINT "JobUserScheduleCalendar_workflowStageId_fkey" FOREIGN KEY ("workflowStageId") REFERENCES "WorkflowStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobUserScheduleCalendar" ADD CONSTRAINT "JobUserScheduleCalendar_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobUserScheduleCalendar" ADD CONSTRAINT "JobUserScheduleCalendar_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
