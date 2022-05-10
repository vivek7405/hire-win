/*
  Warnings:

  - You are about to drop the column `moreAttendees` on the `Interview` table. All the data in the column will be lost.
  - Added the required column `interviewerId` to the `Interview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizerId` to the `Interview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "moreAttendees",
ADD COLUMN     "interviewerId" INTEGER NOT NULL,
ADD COLUMN     "organizerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otherAttendeeInterviewId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_otherAttendeeInterviewId_fkey" FOREIGN KEY ("otherAttendeeInterviewId") REFERENCES "Interview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
