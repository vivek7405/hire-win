/*
  Warnings:

  - You are about to drop the column `interviewerId` on the `Candidate` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_interviewerId_fkey";

-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "interviewerId";

-- CreateTable
CREATE TABLE "CandidateWorkflowStageInterviewer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "candidateId" TEXT NOT NULL,
    "workflowStageId" TEXT NOT NULL,
    "interviewerId" INTEGER NOT NULL,

    CONSTRAINT "CandidateWorkflowStageInterviewer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateWorkflowStageInterviewer_candidateId_workflowStage_key" ON "CandidateWorkflowStageInterviewer"("candidateId", "workflowStageId", "interviewerId");

-- AddForeignKey
ALTER TABLE "CandidateWorkflowStageInterviewer" ADD CONSTRAINT "CandidateWorkflowStageInterviewer_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateWorkflowStageInterviewer" ADD CONSTRAINT "CandidateWorkflowStageInterviewer_workflowStageId_fkey" FOREIGN KEY ("workflowStageId") REFERENCES "WorkflowStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateWorkflowStageInterviewer" ADD CONSTRAINT "CandidateWorkflowStageInterviewer_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
