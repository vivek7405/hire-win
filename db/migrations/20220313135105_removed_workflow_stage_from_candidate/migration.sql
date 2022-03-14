/*
  Warnings:

  - You are about to drop the column `workflowStageId` on the `Candidate` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_workflowStageId_fkey";

-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "workflowStageId";
