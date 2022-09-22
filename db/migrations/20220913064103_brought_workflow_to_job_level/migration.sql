/*
  Warnings:

  - You are about to drop the column `workflowId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `workflowId` on the `WorkflowStage` table. All the data in the column will be lost.
  - You are about to drop the `Workflow` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[jobId,stageId]` on the table `WorkflowStage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[jobId,stageId,order]` on the table `WorkflowStage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `jobId` to the `WorkflowStage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "Workflow" DROP CONSTRAINT "Workflow_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Workflow" DROP CONSTRAINT "Workflow_createdById_fkey";

-- DropForeignKey
ALTER TABLE "WorkflowStage" DROP CONSTRAINT "WorkflowStage_workflowId_fkey";

-- DropIndex
DROP INDEX "WorkflowStage_workflowId_stageId_key";

-- DropIndex
DROP INDEX "WorkflowStage_workflowId_stageId_order_key";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "workflowId";

-- AlterTable
ALTER TABLE "WorkflowStage" DROP COLUMN "workflowId",
ADD COLUMN     "jobId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Workflow";

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStage_jobId_stageId_key" ON "WorkflowStage"("jobId", "stageId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStage_jobId_stageId_order_key" ON "WorkflowStage"("jobId", "stageId", "order");

-- AddForeignKey
ALTER TABLE "WorkflowStage" ADD CONSTRAINT "WorkflowStage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
