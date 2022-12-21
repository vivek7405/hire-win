-- DropForeignKey
ALTER TABLE "CandidateStageInterviewer" DROP CONSTRAINT "CandidateStageInterviewer_stageId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_stageId_fkey";

-- DropForeignKey
ALTER TABLE "Email" DROP CONSTRAINT "Email_stageId_fkey";

-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_stageId_fkey";

-- DropForeignKey
ALTER TABLE "ScoreCardQuestion" DROP CONSTRAINT "ScoreCardQuestion_stageId_fkey";

-- DropForeignKey
ALTER TABLE "StageUserScheduleCalendar" DROP CONSTRAINT "StageUserScheduleCalendar_stageId_fkey";

-- AddForeignKey
ALTER TABLE "StageUserScheduleCalendar" ADD CONSTRAINT "StageUserScheduleCalendar_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreCardQuestion" ADD CONSTRAINT "ScoreCardQuestion_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateStageInterviewer" ADD CONSTRAINT "CandidateStageInterviewer_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
