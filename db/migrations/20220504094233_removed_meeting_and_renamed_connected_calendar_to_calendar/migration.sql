/*
  Warnings:

  - You are about to drop the column `meetingId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the `ConnectedCalendar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Meeting` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CalendarType" AS ENUM ('CaldavDigest', 'CaldavBasic', 'GoogleCalendar', 'OutlookCalendar');

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_meetingId_fkey";

-- DropForeignKey
ALTER TABLE "ConnectedCalendar" DROP CONSTRAINT "ConnectedCalendar_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "DefaultCalendar" DROP CONSTRAINT "DefaultCalendar_calendarId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewDetail" DROP CONSTRAINT "InterviewDetail_calendarId_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_defaultConnectedCalendarId_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_ownerName_fkey";

-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_scheduleId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "meetingId";

-- DropTable
DROP TABLE "ConnectedCalendar";

-- DropTable
DROP TABLE "Meeting";

-- DropEnum
DROP TYPE "ConnectedCalendarStatus";

-- DropEnum
DROP TYPE "ConnectedCalendarType";

-- CreateTable
CREATE TABLE "Calendar" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "caldavAddress" TEXT,
    "username" TEXT,
    "encryptedPassword" TEXT,
    "refreshToken" TEXT,
    "ownerId" INTEGER NOT NULL,
    "type" "CalendarType" NOT NULL,

    CONSTRAINT "Calendar_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InterviewDetail" ADD CONSTRAINT "InterviewDetail_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultCalendar" ADD CONSTRAINT "DefaultCalendar_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calendar" ADD CONSTRAINT "Calendar_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
