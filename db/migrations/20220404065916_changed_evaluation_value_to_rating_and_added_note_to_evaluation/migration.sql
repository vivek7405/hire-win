/*
  Warnings:

  - You are about to drop the column `value` on the `Evaluation` table. All the data in the column will be lost.
  - Added the required column `note` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `Evaluation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Evaluation_candidateId_scoreCardQuestionId_value_key";

-- AlterTable
ALTER TABLE "Evaluation" DROP COLUMN "value",
ADD COLUMN     "note" TEXT NOT NULL,
ADD COLUMN     "rating" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "EvaluationValue";
