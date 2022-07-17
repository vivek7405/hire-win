/*
  Warnings:

  - You are about to drop the column `slug` on the `Candidate` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Candidate_jobId_slug_key";

-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "slug";
