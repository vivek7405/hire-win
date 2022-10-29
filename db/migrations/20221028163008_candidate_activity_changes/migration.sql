-- CreateEnum
CREATE TYPE "CandidateActivityType" AS ENUM ('Candidate_Added', 'Candidate_Updated', 'Score_Submitted', 'Interviewer_Changed', 'Stage_Changed', 'Interview_Scheduled', 'Interview_Cancelled', 'Comment_Added', 'Replied_To_Comment', 'Comment_Deleted', 'Email_Sent', 'Email_Deleted', 'Added_To_Pool', 'Removed_From_Pool', 'File_Added', 'File_Deleted');

-- CreateTable
CREATE TABLE "CandidateActivity" (
    "id" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "type" "CandidateActivityType" NOT NULL,
    "candidateId" TEXT NOT NULL,
    "performedByUserId" TEXT,
    "primaryInteractionUserId" TEXT,
    "secondaryInteractionUserId" TEXT,
    "primaryStageId" TEXT,
    "secondaryStageId" TEXT,
    "fileId" TEXT,
    "candidatePoolId" TEXT,
    "emailId" TEXT,
    "scoreId" TEXT,
    "commentId" TEXT,
    "replyCommentId" TEXT,

    CONSTRAINT "CandidateActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_performedByUserId_fkey" FOREIGN KEY ("performedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_primaryInteractionUserId_fkey" FOREIGN KEY ("primaryInteractionUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_secondaryInteractionUserId_fkey" FOREIGN KEY ("secondaryInteractionUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_primaryStageId_fkey" FOREIGN KEY ("primaryStageId") REFERENCES "Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_secondaryStageId_fkey" FOREIGN KEY ("secondaryStageId") REFERENCES "Stage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_scoreId_fkey" FOREIGN KEY ("scoreId") REFERENCES "Score"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "CandidateFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_replyCommentId_fkey" FOREIGN KEY ("replyCommentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_candidatePoolId_fkey" FOREIGN KEY ("candidatePoolId") REFERENCES "CandidatePool"("id") ON DELETE SET NULL ON UPDATE CASCADE;
