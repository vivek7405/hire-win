-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "calendarLink" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "eventId" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "meetingLink" TEXT NOT NULL DEFAULT E'';
