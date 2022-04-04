/*
  Warnings:

  - A unique constraint covering the columns `[scoreCardId,jobId,workflowStageId]` on the table `ScoreCardJobWorkflowStage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ScoreCardJobWorkflowStage_scoreCardId_jobId_key";

-- CreateIndex
CREATE UNIQUE INDEX "ScoreCardJobWorkflowStage_scoreCardId_jobId_workflowStageId_key" ON "ScoreCardJobWorkflowStage"("scoreCardId", "jobId", "workflowStageId");
