/*
  Warnings:

  - You are about to drop the column `workflowStageId` on the `Candidate` table. All the data in the column will be lost.
  - You are about to drop the column `workflowStageId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `workflowStageId` on the `Email` table. All the data in the column will be lost.
  - The `behaviour` column on the `FormQuestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `workflowStageId` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `workflowStageId` on the `InterviewDetail` table. All the data in the column will be lost.
  - You are about to drop the column `workflowStageId` on the `JobUserScheduleCalendar` table. All the data in the column will be lost.
  - You are about to drop the column `workflowStageId` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `cardQuestionId` on the `ScoreCardQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `scoreCardId` on the `ScoreCardQuestion` table. All the data in the column will be lost.
  - The `behaviour` column on the `ScoreCardQuestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `companyId` on the `Stage` table. All the data in the column will be lost.
  - You are about to drop the `CandidateWorkflowStageInterviewer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CardQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScoreCard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ScoreCardJobWorkflowStage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkflowStage` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[jobId,stageId]` on the table `InterviewDetail` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[jobId,stageId,userId]` on the table `JobUserScheduleCalendar` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[candidateId,scoreCardQuestionId,stageId]` on the table `Score` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `ScoreCardQuestion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,order]` on the table `ScoreCardQuestion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[jobId,slug]` on the table `Stage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[jobId,name,order]` on the table `Stage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stageId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stageId` to the `Email` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stageId` to the `Interview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stageId` to the `InterviewDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stageId` to the `JobUserScheduleCalendar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stageId` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `ScoreCardQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `ScoreCardQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobId` to the `Stage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `Stage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Behaviour" AS ENUM ('REQUIRED', 'OPTIONAL', 'OFF');

-- DropForeignKey
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_workflowStageId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateWorkflowStageInterviewer" DROP CONSTRAINT "CandidateWorkflowStageInterviewer_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateWorkflowStageInterviewer" DROP CONSTRAINT "CandidateWorkflowStageInterviewer_interviewerId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateWorkflowStageInterviewer" DROP CONSTRAINT "CandidateWorkflowStageInterviewer_workflowStageId_fkey";

-- DropForeignKey
ALTER TABLE "CardQuestion" DROP CONSTRAINT "CardQuestion_companyId_fkey";

-- DropForeignKey
ALTER TABLE "CardQuestion" DROP CONSTRAINT "CardQuestion_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_workflowStageId_fkey";

-- DropForeignKey
ALTER TABLE "Email" DROP CONSTRAINT "Email_workflowStageId_fkey";

-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_workflowStageId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewDetail" DROP CONSTRAINT "InterviewDetail_workflowStageId_fkey";

-- DropForeignKey
ALTER TABLE "JobUserScheduleCalendar" DROP CONSTRAINT "JobUserScheduleCalendar_workflowStageId_fkey";

-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_workflowStageId_fkey";

-- DropForeignKey
ALTER TABLE "ScoreCard" DROP CONSTRAINT "ScoreCard_companyId_fkey";

-- DropForeignKey
ALTER TABLE "ScoreCard" DROP CONSTRAINT "ScoreCard_createdById_fkey";

-- DropForeignKey
ALTER TABLE "ScoreCardJobWorkflowStage" DROP CONSTRAINT "ScoreCardJobWorkflowStage_jobId_fkey";

-- DropForeignKey
ALTER TABLE "ScoreCardJobWorkflowStage" DROP CONSTRAINT "ScoreCardJobWorkflowStage_scoreCardId_fkey";

-- DropForeignKey
ALTER TABLE "ScoreCardJobWorkflowStage" DROP CONSTRAINT "ScoreCardJobWorkflowStage_workflowStageId_fkey";

-- DropForeignKey
ALTER TABLE "ScoreCardQuestion" DROP CONSTRAINT "ScoreCardQuestion_cardQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "ScoreCardQuestion" DROP CONSTRAINT "ScoreCardQuestion_scoreCardId_fkey";

-- DropForeignKey
ALTER TABLE "Stage" DROP CONSTRAINT "Stage_companyId_fkey";

-- DropForeignKey
ALTER TABLE "WorkflowStage" DROP CONSTRAINT "WorkflowStage_jobId_fkey";

-- DropForeignKey
ALTER TABLE "WorkflowStage" DROP CONSTRAINT "WorkflowStage_stageId_fkey";

-- DropIndex
DROP INDEX "InterviewDetail_jobId_workflowStageId_key";

-- DropIndex
DROP INDEX "JobUserScheduleCalendar_jobId_workflowStageId_userId_key";

-- DropIndex
DROP INDEX "Score_candidateId_scoreCardQuestionId_workflowStageId_key";

-- DropIndex
DROP INDEX "ScoreCardQuestion_scoreCardId_cardQuestionId_key";

-- DropIndex
DROP INDEX "ScoreCardQuestion_scoreCardId_cardQuestionId_order_key";

-- DropIndex
DROP INDEX "Stage_companyId_slug_key";

-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "workflowStageId",
ADD COLUMN     "stageId" TEXT;

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "workflowStageId",
ADD COLUMN     "stageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Email" DROP COLUMN "workflowStageId",
ADD COLUMN     "stageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FormQuestion" DROP COLUMN "behaviour",
ADD COLUMN     "behaviour" "Behaviour" NOT NULL DEFAULT E'OPTIONAL';

-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "workflowStageId",
ADD COLUMN     "stageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InterviewDetail" DROP COLUMN "workflowStageId",
ADD COLUMN     "stageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "JobUserScheduleCalendar" DROP COLUMN "workflowStageId",
ADD COLUMN     "stageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Score" DROP COLUMN "workflowStageId",
ADD COLUMN     "stageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ScoreCardQuestion" DROP COLUMN "cardQuestionId",
DROP COLUMN "scoreCardId",
ADD COLUMN     "allowEdit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
DROP COLUMN "behaviour",
ADD COLUMN     "behaviour" "Behaviour" NOT NULL DEFAULT E'OPTIONAL';

-- AlterTable
ALTER TABLE "Stage" DROP COLUMN "companyId",
ADD COLUMN     "jobId" TEXT NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL;

-- DropTable
DROP TABLE "CandidateWorkflowStageInterviewer";

-- DropTable
DROP TABLE "CardQuestion";

-- DropTable
DROP TABLE "ScoreCard";

-- DropTable
DROP TABLE "ScoreCardJobWorkflowStage";

-- DropTable
DROP TABLE "WorkflowStage";

-- DropEnum
DROP TYPE "FormQuestionBehaviour";

-- DropEnum
DROP TYPE "ScoreCardQuestionBehaviour";

-- CreateTable
CREATE TABLE "CandidateStageInterviewer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "candidateId" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,

    CONSTRAINT "CandidateStageInterviewer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ScoreCardQuestionToStage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateStageInterviewer_candidateId_stageId_key" ON "CandidateStageInterviewer"("candidateId", "stageId");

-- CreateIndex
CREATE UNIQUE INDEX "_ScoreCardQuestionToStage_AB_unique" ON "_ScoreCardQuestionToStage"("A", "B");

-- CreateIndex
CREATE INDEX "_ScoreCardQuestionToStage_B_index" ON "_ScoreCardQuestionToStage"("B");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewDetail_jobId_stageId_key" ON "InterviewDetail"("jobId", "stageId");

-- CreateIndex
CREATE UNIQUE INDEX "JobUserScheduleCalendar_jobId_stageId_userId_key" ON "JobUserScheduleCalendar"("jobId", "stageId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Score_candidateId_scoreCardQuestionId_stageId_key" ON "Score"("candidateId", "scoreCardQuestionId", "stageId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreCardQuestion_slug_key" ON "ScoreCardQuestion"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreCardQuestion_name_order_key" ON "ScoreCardQuestion"("name", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Stage_jobId_slug_key" ON "Stage"("jobId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Stage_jobId_name_order_key" ON "Stage"("jobId", "name", "order");

-- AddForeignKey
ALTER TABLE "InterviewDetail" ADD CONSTRAINT "InterviewDetail_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobUserScheduleCalendar" ADD CONSTRAINT "JobUserScheduleCalendar_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreCardQuestion" ADD CONSTRAINT "ScoreCardQuestion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateStageInterviewer" ADD CONSTRAINT "CandidateStageInterviewer_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateStageInterviewer" ADD CONSTRAINT "CandidateStageInterviewer_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateStageInterviewer" ADD CONSTRAINT "CandidateStageInterviewer_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScoreCardQuestionToStage" ADD FOREIGN KEY ("A") REFERENCES "ScoreCardQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScoreCardQuestionToStage" ADD FOREIGN KEY ("B") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
