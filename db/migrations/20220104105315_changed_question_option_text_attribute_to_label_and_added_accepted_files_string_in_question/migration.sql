/*
  Warnings:

  - You are about to drop the column `text` on the `QuestionOption` table. All the data in the column will be lost.
  - Added the required column `label` to the `QuestionOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "acceptedFiles" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "QuestionOption" DROP COLUMN "text",
ADD COLUMN     "label" TEXT NOT NULL;
