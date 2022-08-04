/*
  Warnings:

  - The values [Job_Board,LinkedIn] on the enum `CandidateSource` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CandidateSource_new" AS ENUM ('Manual', 'Careers_Page');
ALTER TABLE "Candidate" ALTER COLUMN "source" TYPE "CandidateSource_new" USING ("source"::text::"CandidateSource_new");
ALTER TYPE "CandidateSource" RENAME TO "CandidateSource_old";
ALTER TYPE "CandidateSource_new" RENAME TO "CandidateSource";
DROP TYPE "CandidateSource_old";
COMMIT;
