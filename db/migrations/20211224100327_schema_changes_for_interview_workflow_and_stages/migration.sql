/*
  Warnings:

  - Added the required column `userId` to the `Stage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Stage" DROP CONSTRAINT "Stage_workflowId_fkey";

-- AlterTable
ALTER TABLE "Stage" ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "workflowId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
