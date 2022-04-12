-- CreateEnum
CREATE TYPE "ConnectedCalendarStatus" AS ENUM ('active');

-- CreateEnum
CREATE TYPE "ConnectedCalendarType" AS ENUM ('CaldavDigest', 'CaldavBasic', 'GoogleCalendar', 'OutlookCalendar');

-- CreateTable
CREATE TABLE "DefaultCalendar" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "calendarId" INTEGER NOT NULL,

    CONSTRAINT "DefaultCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectedCalendar" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "caldavAddress" TEXT,
    "username" TEXT,
    "encryptedPassword" TEXT,
    "refreshToken" TEXT,
    "ownerId" INTEGER NOT NULL,
    "status" "ConnectedCalendarStatus" NOT NULL,
    "type" "ConnectedCalendarType" NOT NULL,

    CONSTRAINT "ConnectedCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meeting" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "startDateUTC" TIMESTAMP(3) NOT NULL,
    "endDateUTC" TIMESTAMP(3) NOT NULL,
    "scheduleId" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "defaultConnectedCalendarId" INTEGER NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailySchedule" (
    "id" SERIAL NOT NULL,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "scheduleId" INTEGER NOT NULL,

    CONSTRAINT "DailySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "meetingId" INTEGER NOT NULL,
    "inviteeEmail" TEXT NOT NULL,
    "startDateUTC" TIMESTAMP(3) NOT NULL,
    "cancelCode" TEXT NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DefaultCalendar_userId_key" ON "DefaultCalendar"("userId");

-- AddForeignKey
ALTER TABLE "DefaultCalendar" ADD CONSTRAINT "DefaultCalendar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultCalendar" ADD CONSTRAINT "DefaultCalendar_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "ConnectedCalendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConnectedCalendar" ADD CONSTRAINT "ConnectedCalendar_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_ownerName_fkey" FOREIGN KEY ("ownerName") REFERENCES "User"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_defaultConnectedCalendarId_fkey" FOREIGN KEY ("defaultConnectedCalendarId") REFERENCES "ConnectedCalendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySchedule" ADD CONSTRAINT "DailySchedule_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
