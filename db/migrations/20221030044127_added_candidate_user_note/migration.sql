-- CreateTable
CREATE TABLE "CandidateUserNote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "candidateId" TEXT NOT NULL,
    "note" JSONB NOT NULL,

    CONSTRAINT "CandidateUserNote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CandidateUserNote" ADD CONSTRAINT "CandidateUserNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateUserNote" ADD CONSTRAINT "CandidateUserNote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
