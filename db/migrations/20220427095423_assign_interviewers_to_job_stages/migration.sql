-- CreateTable
CREATE TABLE "InterviewerJobWorkflowStage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "interviewerId" INTEGER NOT NULL,
    "jobId" TEXT NOT NULL,
    "workflowStageId" TEXT NOT NULL,

    CONSTRAINT "InterviewerJobWorkflowStage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewerJobWorkflowStage_interviewerId_jobId_workflowSta_key" ON "InterviewerJobWorkflowStage"("interviewerId", "jobId", "workflowStageId");

-- AddForeignKey
ALTER TABLE "InterviewerJobWorkflowStage" ADD CONSTRAINT "InterviewerJobWorkflowStage_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewerJobWorkflowStage" ADD CONSTRAINT "InterviewerJobWorkflowStage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewerJobWorkflowStage" ADD CONSTRAINT "InterviewerJobWorkflowStage_workflowStageId_fkey" FOREIGN KEY ("workflowStageId") REFERENCES "WorkflowStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
