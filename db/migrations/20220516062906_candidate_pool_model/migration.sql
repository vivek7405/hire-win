-- CreateTable
CREATE TABLE "CandidatePool" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CandidatePool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CandidateToCandidatePool" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidatePool_slug_key" ON "CandidatePool"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CandidatePool_userId_name_key" ON "CandidatePool"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "_CandidateToCandidatePool_AB_unique" ON "_CandidateToCandidatePool"("A", "B");

-- CreateIndex
CREATE INDEX "_CandidateToCandidatePool_B_index" ON "_CandidateToCandidatePool"("B");

-- AddForeignKey
ALTER TABLE "CandidatePool" ADD CONSTRAINT "CandidatePool_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CandidateToCandidatePool" ADD FOREIGN KEY ("A") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CandidateToCandidatePool" ADD FOREIGN KEY ("B") REFERENCES "CandidatePool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
