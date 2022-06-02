-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "factory" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ScoreCard" ADD COLUMN     "factory" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN     "factory" BOOLEAN NOT NULL DEFAULT false;
