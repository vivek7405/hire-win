/*
  Warnings:

  - You are about to drop the column `candidateId` on the `ScoreCard` table. All the data in the column will be lost.
  - You are about to drop the column `scoreId` on the `ScoreCardQuestion` table. All the data in the column will be lost.
  - You are about to drop the `Rating` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[scoreCardId,cardQuestionId]` on the table `ScoreCardQuestion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[scoreCardId,cardQuestionId,order]` on the table `ScoreCardQuestion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `scoreCardId` to the `ScoreCardQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EvaluationValue" AS ENUM ('VERY_POOR', 'POOR', 'AVERAGE', 'GOOD', 'VERY_GOOD');

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_cardQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "ScoreCard" DROP CONSTRAINT "ScoreCard_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "ScoreCardQuestion" DROP CONSTRAINT "ScoreCardQuestion_scoreId_fkey";

-- DropIndex
DROP INDEX "ScoreCardQuestion_scoreId_cardQuestionId_key";

-- DropIndex
DROP INDEX "ScoreCardQuestion_scoreId_cardQuestionId_order_key";

-- AlterTable
ALTER TABLE "ScoreCard" DROP COLUMN "candidateId";

-- AlterTable
ALTER TABLE "ScoreCardQuestion" DROP COLUMN "scoreId",
ADD COLUMN     "scoreCardId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Rating";

-- DropEnum
DROP TYPE "RatingValue";

-- CreateTable
CREATE TABLE "ScoreCardJobWorkflowStage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "scoreCardId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "workflowStageId" TEXT NOT NULL,

    CONSTRAINT "ScoreCardJobWorkflowStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "value" "EvaluationValue" NOT NULL,
    "scoreCardQuestionId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScoreCardJobWorkflowStage_scoreCardId_jobId_key" ON "ScoreCardJobWorkflowStage"("scoreCardId", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_candidateId_scoreCardQuestionId_key" ON "Evaluation"("candidateId", "scoreCardQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_candidateId_scoreCardQuestionId_value_key" ON "Evaluation"("candidateId", "scoreCardQuestionId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreCardQuestion_scoreCardId_cardQuestionId_key" ON "ScoreCardQuestion"("scoreCardId", "cardQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreCardQuestion_scoreCardId_cardQuestionId_order_key" ON "ScoreCardQuestion"("scoreCardId", "cardQuestionId", "order");

-- AddForeignKey
ALTER TABLE "ScoreCardQuestion" ADD CONSTRAINT "ScoreCardQuestion_scoreCardId_fkey" FOREIGN KEY ("scoreCardId") REFERENCES "ScoreCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreCardJobWorkflowStage" ADD CONSTRAINT "ScoreCardJobWorkflowStage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreCardJobWorkflowStage" ADD CONSTRAINT "ScoreCardJobWorkflowStage_workflowStageId_fkey" FOREIGN KEY ("workflowStageId") REFERENCES "WorkflowStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreCardJobWorkflowStage" ADD CONSTRAINT "ScoreCardJobWorkflowStage_scoreCardId_fkey" FOREIGN KEY ("scoreCardId") REFERENCES "ScoreCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_scoreCardQuestionId_fkey" FOREIGN KEY ("scoreCardQuestionId") REFERENCES "ScoreCardQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
