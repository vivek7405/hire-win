/*
  Warnings:

  - A unique constraint covering the columns `[candidateId,scoreCardQuestionId,workflowStageId]` on the table `Score` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Score_candidateId_scoreCardQuestionId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Score_candidateId_scoreCardQuestionId_workflowStageId_key" ON "Score"("candidateId", "scoreCardQuestionId", "workflowStageId");
