-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "interviewerId" INTEGER;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
