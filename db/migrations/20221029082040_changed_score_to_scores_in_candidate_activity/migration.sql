/*
  Warnings:

  - You are about to drop the column `scoreId` on the `CandidateActivity` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CandidateActivity" DROP CONSTRAINT "CandidateActivity_scoreId_fkey";

-- AlterTable
ALTER TABLE "CandidateActivity" DROP COLUMN "scoreId";

-- AlterTable
ALTER TABLE "Score" ADD COLUMN     "candidateActivityId" TEXT;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_candidateActivityId_fkey" FOREIGN KEY ("candidateActivityId") REFERENCES "CandidateActivity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
