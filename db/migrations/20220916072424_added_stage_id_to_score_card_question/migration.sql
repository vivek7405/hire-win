/*
  Warnings:

  - You are about to drop the `_ScoreCardQuestionToStage` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[stageId,slug]` on the table `ScoreCardQuestion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stageId` to the `ScoreCardQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ScoreCardQuestionToStage" DROP CONSTRAINT "_ScoreCardQuestionToStage_A_fkey";

-- DropForeignKey
ALTER TABLE "_ScoreCardQuestionToStage" DROP CONSTRAINT "_ScoreCardQuestionToStage_B_fkey";

-- DropIndex
DROP INDEX "ScoreCardQuestion_name_order_key";

-- DropIndex
DROP INDEX "ScoreCardQuestion_slug_key";

-- AlterTable
ALTER TABLE "ScoreCardQuestion" ADD COLUMN     "stageId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_ScoreCardQuestionToStage";

-- CreateIndex
CREATE UNIQUE INDEX "ScoreCardQuestion_stageId_slug_key" ON "ScoreCardQuestion"("stageId", "slug");

-- AddForeignKey
ALTER TABLE "ScoreCardQuestion" ADD CONSTRAINT "ScoreCardQuestion_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
