/*
  Warnings:

  - You are about to drop the column `behaviour` on the `Question` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FormQuestionBehaviour" AS ENUM ('REQUIRED', 'OPTIONAL', 'OFF');

-- AlterTable
ALTER TABLE "FormQuestion" ADD COLUMN     "behaviour" "FormQuestionBehaviour" NOT NULL DEFAULT E'OPTIONAL';

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "behaviour";

-- DropEnum
DROP TYPE "QuestionBehaviour";
