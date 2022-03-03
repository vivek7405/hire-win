/*
  Warnings:

  - You are about to drop the column `hidden` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `required` on the `Question` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "QuestionBehaviour" AS ENUM ('REQUIRED', 'OPTIONAL', 'OFF');

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "hidden",
DROP COLUMN "required",
ADD COLUMN     "behaviour" "QuestionBehaviour" NOT NULL DEFAULT E'OPTIONAL';
