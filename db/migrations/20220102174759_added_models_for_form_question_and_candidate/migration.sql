/*
  Warnings:

  - Added the required column `hidden` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `info` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placeholder` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `required` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('Single_line_text', 'Long_text', 'Attachment', 'Checkbox', 'Multiple_select', 'Single_select', 'Date', 'Phone_number', 'Email', 'URL', 'Number', 'Rating');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "hidden" BOOLEAN NOT NULL,
ADD COLUMN     "info" TEXT NOT NULL,
ADD COLUMN     "placeholder" TEXT NOT NULL,
ADD COLUMN     "required" BOOLEAN NOT NULL,
ADD COLUMN     "type" "QuestionType" NOT NULL DEFAULT E'Single_line_text';

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "text" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "answer" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Answer_candidateId_questionId_key" ON "Answer"("candidateId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_candidateId_questionId_answer_key" ON "Answer"("candidateId", "questionId", "answer");

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
