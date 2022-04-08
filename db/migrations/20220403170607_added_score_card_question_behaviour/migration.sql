-- CreateEnum
CREATE TYPE "ScoreCardQuestionBehaviour" AS ENUM ('REQUIRED', 'OPTIONAL', 'OFF');

-- AlterTable
ALTER TABLE "ScoreCardQuestion" ADD COLUMN     "allowBehaviourEdit" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "behaviour" "ScoreCardQuestionBehaviour" NOT NULL DEFAULT E'OPTIONAL';
