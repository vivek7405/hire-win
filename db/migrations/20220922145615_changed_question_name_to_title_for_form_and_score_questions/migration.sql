/*
  Warnings:

  - You are about to drop the column `name` on the `FormQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ScoreCardQuestion` table. All the data in the column will be lost.
  - Added the required column `title` to the `FormQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `ScoreCardQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FormQuestion" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ScoreCardQuestion" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL;
