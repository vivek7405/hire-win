/*
  Warnings:

  - You are about to drop the `AssignedWorkflowStage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssignedWorkflowStage" DROP CONSTRAINT "AssignedWorkflowStage_stageId_fkey";

-- DropForeignKey
ALTER TABLE "AssignedWorkflowStage" DROP CONSTRAINT "AssignedWorkflowStage_userId_fkey";

-- DropForeignKey
ALTER TABLE "AssignedWorkflowStage" DROP CONSTRAINT "AssignedWorkflowStage_workflowId_fkey";

-- DropTable
DROP TABLE "AssignedWorkflowStage";

-- CreateTable
CREATE TABLE "WorkflowStage" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL,
    "stageId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "WorkflowStage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStage_userId_workflowId_stageId_key" ON "WorkflowStage"("userId", "workflowId", "stageId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStage_workflowId_stageId_key" ON "WorkflowStage"("workflowId", "stageId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStage_workflowId_stageId_order_key" ON "WorkflowStage"("workflowId", "stageId", "order");

-- AddForeignKey
ALTER TABLE "WorkflowStage" ADD CONSTRAINT "WorkflowStage_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStage" ADD CONSTRAINT "WorkflowStage_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowStage" ADD CONSTRAINT "WorkflowStage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
