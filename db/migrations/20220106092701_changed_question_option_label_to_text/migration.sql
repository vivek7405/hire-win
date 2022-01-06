/*
  Warnings:

  - You are about to drop the column `label` on the `QuestionOption` table. All the data in the column will be lost.
  - Added the required column `text` to the `QuestionOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuestionOption" DROP COLUMN "label",
ADD COLUMN     "text" TEXT NOT NULL;
