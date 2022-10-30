/*
  Warnings:

  - A unique constraint covering the columns `[candidateId,userId]` on the table `CandidateUserNote` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `CandidateUserNote` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CandidateUserNote" DROP CONSTRAINT "CandidateUserNote_userId_fkey";

-- AlterTable
ALTER TABLE "CandidateUserNote" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CandidateUserNote_candidateId_userId_key" ON "CandidateUserNote"("candidateId", "userId");

-- AddForeignKey
ALTER TABLE "CandidateUserNote" ADD CONSTRAINT "CandidateUserNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
