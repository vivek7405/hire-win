/*
  Warnings:

  - You are about to drop the column `questionId` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `questionId` on the `FormQuestion` table. All the data in the column will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionOption` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[candidateId,formQuestionId]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[candidateId,formQuestionId,value]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[jobId,slug]` on the table `FormQuestion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `formQuestionId` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `FormQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `FormQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "FormQuestion" DROP CONSTRAINT "FormQuestion_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_createdById_fkey";

-- DropForeignKey
ALTER TABLE "QuestionOption" DROP CONSTRAINT "QuestionOption_questionId_fkey";

-- DropIndex
DROP INDEX "Answer_candidateId_questionId_key";

-- DropIndex
DROP INDEX "Answer_candidateId_questionId_value_key";

-- DropIndex
DROP INDEX "FormQuestion_jobId_questionId_key";

-- DropIndex
DROP INDEX "FormQuestion_jobId_questionId_order_key";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "questionId",
ADD COLUMN     "formQuestionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FormQuestion" DROP COLUMN "questionId",
ADD COLUMN     "acceptedFiles" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "allowEdit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "placeholder" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "type" "QuestionType" NOT NULL DEFAULT E'Single_line_text';

-- DropTable
DROP TABLE "Question";

-- DropTable
DROP TABLE "QuestionOption";

-- CreateTable
CREATE TABLE "FormQuestionOption" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "text" TEXT NOT NULL,
    "formQuestionId" TEXT NOT NULL,

    CONSTRAINT "FormQuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Answer_candidateId_formQuestionId_key" ON "Answer"("candidateId", "formQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_candidateId_formQuestionId_value_key" ON "Answer"("candidateId", "formQuestionId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "FormQuestion_jobId_slug_key" ON "FormQuestion"("jobId", "slug");

-- AddForeignKey
ALTER TABLE "FormQuestion" ADD CONSTRAINT "FormQuestion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormQuestionOption" ADD CONSTRAINT "FormQuestionOption_formQuestionId_fkey" FOREIGN KEY ("formQuestionId") REFERENCES "FormQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_formQuestionId_fkey" FOREIGN KEY ("formQuestionId") REFERENCES "FormQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
