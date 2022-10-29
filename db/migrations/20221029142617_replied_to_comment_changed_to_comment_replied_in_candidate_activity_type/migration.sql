/*
  Warnings:

  - The values [Replied_To_Comment] on the enum `CandidateActivityType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CandidateActivityType_new" AS ENUM ('Candidate_Added', 'Candidate_Updated', 'Candidate_Rejected', 'Candidate_Restored', 'Score_Submitted', 'Interviewer_Changed', 'Stage_Changed', 'Interview_Scheduled', 'Interview_Cancelled', 'Comment_Added', 'Comment_Replied', 'Comment_Deleted', 'Email_Sent', 'Email_Deleted', 'Added_To_Pool', 'Removed_From_Pool', 'File_Added', 'File_Deleted');
ALTER TABLE "CandidateActivity" ALTER COLUMN "type" TYPE "CandidateActivityType_new" USING ("type"::text::"CandidateActivityType_new");
ALTER TYPE "CandidateActivityType" RENAME TO "CandidateActivityType_old";
ALTER TYPE "CandidateActivityType_new" RENAME TO "CandidateActivityType";
DROP TYPE "CandidateActivityType_old";
COMMIT;
