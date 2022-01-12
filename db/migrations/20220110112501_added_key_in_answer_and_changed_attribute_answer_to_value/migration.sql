/*
  Warnings:

  - You are about to drop the column `answer` on the `Answer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[candidateId,questionId,value]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Answer` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Answer_candidateId_questionId_answer_key";

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "answer",
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Answer_candidateId_questionId_value_key" ON "Answer"("candidateId", "questionId", "value");
