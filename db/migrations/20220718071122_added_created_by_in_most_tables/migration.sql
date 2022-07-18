/*
  Warnings:

  - You are about to drop the column `createdByUserId` on the `Job` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_createdByUserId_fkey";

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "CandidatePool" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "CardQuestion" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "EmailTemplate" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "createdByUserId",
ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "ScoreCard" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Stage" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "createdById" TEXT;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreCard" ADD CONSTRAINT "ScoreCard_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardQuestion" ADD CONSTRAINT "CardQuestion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidatePool" ADD CONSTRAINT "CandidatePool_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
