/*
  Warnings:

  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_interviewDetailId_fkey";

-- DropTable
DROP TABLE "Booking";

-- CreateTable
CREATE TABLE "Interview" (
    "id" SERIAL NOT NULL,
    "interviewDetailId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "startDateUTC" TIMESTAMP(3) NOT NULL,
    "cancelCode" TEXT NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_interviewDetailId_fkey" FOREIGN KEY ("interviewDetailId") REFERENCES "InterviewDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
