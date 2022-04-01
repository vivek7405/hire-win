/*
  Warnings:

  - You are about to drop the `Score` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_userId_fkey";

-- DropForeignKey
ALTER TABLE "ScoreCardQuestion" DROP CONSTRAINT "ScoreCardQuestion_scoreId_fkey";

-- DropTable
DROP TABLE "Score";

-- CreateTable
CREATE TABLE "ScoreCard" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "candidateId" TEXT NOT NULL,

    CONSTRAINT "ScoreCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScoreCard_slug_key" ON "ScoreCard"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreCard_userId_name_key" ON "ScoreCard"("userId", "name");

-- AddForeignKey
ALTER TABLE "ScoreCard" ADD CONSTRAINT "ScoreCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreCard" ADD CONSTRAINT "ScoreCard_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreCardQuestion" ADD CONSTRAINT "ScoreCardQuestion_scoreId_fkey" FOREIGN KEY ("scoreId") REFERENCES "ScoreCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
