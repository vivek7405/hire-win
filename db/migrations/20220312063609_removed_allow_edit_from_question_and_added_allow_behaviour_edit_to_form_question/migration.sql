/*
  Warnings:

  - You are about to drop the column `allowEdit` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FormQuestion" ADD COLUMN     "allowBehaviourEdit" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "allowEdit";
