/*
  Warnings:

  - You are about to drop the column `allowEdit` on the `WorkflowStage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Stage" ADD COLUMN     "allowEdit" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "WorkflowStage" DROP COLUMN "allowEdit";
