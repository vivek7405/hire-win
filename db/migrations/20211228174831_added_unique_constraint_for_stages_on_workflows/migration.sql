/*
  Warnings:

  - A unique constraint covering the columns `[userId,workflowId,stageId]` on the table `StagesOnWorkflows` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StagesOnWorkflows_userId_workflowId_stageId_key" ON "StagesOnWorkflows"("userId", "workflowId", "stageId");
