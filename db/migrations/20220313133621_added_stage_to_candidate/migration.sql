-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "workflowStageId" TEXT;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_workflowStageId_fkey" FOREIGN KEY ("workflowStageId") REFERENCES "WorkflowStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
