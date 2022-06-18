/*
  Warnings:

  - A unique constraint covering the columns `[candidateId,workflowStageId]` on the table `CandidateWorkflowStageInterviewer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CandidateWorkflowStageInterviewer_candidateId_workflowStage_key";

-- CreateIndex
CREATE UNIQUE INDEX "CandidateWorkflowStageInterviewer_candidateId_workflowStage_key" ON "CandidateWorkflowStageInterviewer"("candidateId", "workflowStageId");
