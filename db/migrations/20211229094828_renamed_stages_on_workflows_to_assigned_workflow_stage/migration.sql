/*
  Warnings:

  - You are about to drop the `StagesOnWorkflows` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "StagesOnWorkflows" DROP CONSTRAINT "StagesOnWorkflows_stageId_fkey";

-- DropForeignKey
ALTER TABLE "StagesOnWorkflows" DROP CONSTRAINT "StagesOnWorkflows_userId_fkey";

-- DropForeignKey
ALTER TABLE "StagesOnWorkflows" DROP CONSTRAINT "StagesOnWorkflows_workflowId_fkey";

-- DropTable
DROP TABLE "StagesOnWorkflows";

-- CreateTable
CREATE TABLE "AssignedWorkflowStage" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL,
    "stageId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "AssignedWorkflowStage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssignedWorkflowStage_userId_workflowId_stageId_key" ON "AssignedWorkflowStage"("userId", "workflowId", "stageId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignedWorkflowStage_workflowId_stageId_key" ON "AssignedWorkflowStage"("workflowId", "stageId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignedWorkflowStage_workflowId_stageId_order_key" ON "AssignedWorkflowStage"("workflowId", "stageId", "order");

-- AddForeignKey
ALTER TABLE "AssignedWorkflowStage" ADD CONSTRAINT "AssignedWorkflowStage_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedWorkflowStage" ADD CONSTRAINT "AssignedWorkflowStage_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedWorkflowStage" ADD CONSTRAINT "AssignedWorkflowStage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
