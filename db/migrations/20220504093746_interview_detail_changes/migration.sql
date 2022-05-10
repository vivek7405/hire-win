/*
  Warnings:

  - Added the required column `interviewDetailId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `calendarId` to the `InterviewDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `InterviewDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduleId` to the `InterviewDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "interviewDetailId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InterviewDetail" ADD COLUMN     "calendarId" INTEGER NOT NULL,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "scheduleId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "InterviewDetail" ADD CONSTRAINT "InterviewDetail_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "ConnectedCalendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewDetail" ADD CONSTRAINT "InterviewDetail_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_interviewDetailId_fkey" FOREIGN KEY ("interviewDetailId") REFERENCES "InterviewDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
