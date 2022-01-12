/*
  Warnings:

  - Added the required column `source` to the `Candidate` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CandidateSource" AS ENUM ('Manual', 'JobBoard', 'LinkedIn');

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "source" "CandidateSource" NOT NULL;
