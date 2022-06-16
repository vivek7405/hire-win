/*
  Warnings:

  - A unique constraint covering the columns `[jobId,workflowStageId]` on the table `InterviewDetail` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "InterviewDetail_interviewerId_jobId_workflowStageId_key";

-- CreateIndex
CREATE UNIQUE INDEX "InterviewDetail_jobId_workflowStageId_key" ON "InterviewDetail"("jobId", "workflowStageId");
