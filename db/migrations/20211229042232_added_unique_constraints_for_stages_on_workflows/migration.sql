/*
  Warnings:

  - A unique constraint covering the columns `[workflowId,stageId]` on the table `StagesOnWorkflows` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workflowId,stageId,order]` on the table `StagesOnWorkflows` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StagesOnWorkflows_workflowId_stageId_key" ON "StagesOnWorkflows"("workflowId", "stageId");

-- CreateIndex
CREATE UNIQUE INDEX "StagesOnWorkflows_workflowId_stageId_order_key" ON "StagesOnWorkflows"("workflowId", "stageId", "order");
