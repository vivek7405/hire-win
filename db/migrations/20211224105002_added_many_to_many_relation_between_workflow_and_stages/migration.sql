/*
  Warnings:

  - You are about to drop the column `workflowId` on the `Stage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Stage" DROP CONSTRAINT "Stage_workflowId_fkey";

-- DropIndex
DROP INDEX "Stage_workflowId_name_key";

-- DropIndex
DROP INDEX "Stage_workflowId_order_key";

-- AlterTable
ALTER TABLE "Stage" DROP COLUMN "workflowId";

-- CreateTable
CREATE TABLE "_StageToWorkflow" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_StageToWorkflow_AB_unique" ON "_StageToWorkflow"("A", "B");

-- CreateIndex
CREATE INDEX "_StageToWorkflow_B_index" ON "_StageToWorkflow"("B");

-- AddForeignKey
ALTER TABLE "_StageToWorkflow" ADD FOREIGN KEY ("A") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StageToWorkflow" ADD FOREIGN KEY ("B") REFERENCES "Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
