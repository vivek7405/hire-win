/*
  Warnings:

  - You are about to drop the `Evaluation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "Evaluation" DROP CONSTRAINT "Evaluation_scoreCardQuestionId_fkey";

-- DropTable
DROP TABLE "Evaluation";

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rating" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "scoreCardQuestionId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Score_candidateId_scoreCardQuestionId_key" ON "Score"("candidateId", "scoreCardQuestionId");

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_scoreCardQuestionId_fkey" FOREIGN KEY ("scoreCardQuestionId") REFERENCES "ScoreCardQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
