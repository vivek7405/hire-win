/*
  Warnings:

  - You are about to drop the `InterviewDetail` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `duration` to the `Stage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interviewerId` to the `Stage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "InterviewDetail" DROP CONSTRAINT "InterviewDetail_interviewerId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewDetail" DROP CONSTRAINT "InterviewDetail_jobId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewDetail" DROP CONSTRAINT "InterviewDetail_stageId_fkey";

-- AlterTable
ALTER TABLE "Stage" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "interviewerId" TEXT NOT NULL;

-- DropTable
DROP TABLE "InterviewDetail";

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
