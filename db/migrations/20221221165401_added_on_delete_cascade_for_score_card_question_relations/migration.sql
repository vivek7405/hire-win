-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_scoreCardQuestionId_fkey";

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_scoreCardQuestionId_fkey" FOREIGN KEY ("scoreCardQuestionId") REFERENCES "ScoreCardQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
