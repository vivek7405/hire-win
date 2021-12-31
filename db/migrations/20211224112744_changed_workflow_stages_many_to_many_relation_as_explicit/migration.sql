/*
  Warnings:

  - You are about to drop the `_StageToWorkflow` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_StageToWorkflow" DROP CONSTRAINT "_StageToWorkflow_A_fkey";

-- DropForeignKey
ALTER TABLE "_StageToWorkflow" DROP CONSTRAINT "_StageToWorkflow_B_fkey";

-- DropTable
DROP TABLE "_StageToWorkflow";

-- CreateTable
CREATE TABLE "StagesOnWorkflows" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "order" INTEGER NOT NULL,
    "stageId" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "StagesOnWorkflows_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StagesOnWorkflows" ADD CONSTRAINT "StagesOnWorkflows_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StagesOnWorkflows" ADD CONSTRAINT "StagesOnWorkflows_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StagesOnWorkflows" ADD CONSTRAINT "StagesOnWorkflows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
