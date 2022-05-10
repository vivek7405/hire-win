/*
  Warnings:

  - You are about to drop the `InterviewerJobWorkflowStage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "InterviewerJobWorkflowStage" DROP CONSTRAINT "InterviewerJobWorkflowStage_interviewerId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewerJobWorkflowStage" DROP CONSTRAINT "InterviewerJobWorkflowStage_jobId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewerJobWorkflowStage" DROP CONSTRAINT "InterviewerJobWorkflowStage_workflowStageId_fkey";

-- DropTable
DROP TABLE "InterviewerJobWorkflowStage";

-- CreateTable
CREATE TABLE "InterviewDetail" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "interviewerId" INTEGER NOT NULL,
    "jobId" TEXT NOT NULL,
    "workflowStageId" TEXT NOT NULL,

    CONSTRAINT "InterviewDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewDetail_interviewerId_jobId_workflowStageId_key" ON "InterviewDetail"("interviewerId", "jobId", "workflowStageId");

-- AddForeignKey
ALTER TABLE "InterviewDetail" ADD CONSTRAINT "InterviewDetail_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewDetail" ADD CONSTRAINT "InterviewDetail_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewDetail" ADD CONSTRAINT "InterviewDetail_workflowStageId_fkey" FOREIGN KEY ("workflowStageId") REFERENCES "WorkflowStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
