-- DropForeignKey
ALTER TABLE "InterviewDetail" DROP CONSTRAINT "InterviewDetail_calendarId_fkey";

-- AlterTable
ALTER TABLE "InterviewDetail" ALTER COLUMN "calendarId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "InterviewDetail" ADD CONSTRAINT "InterviewDetail_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE SET NULL ON UPDATE CASCADE;
