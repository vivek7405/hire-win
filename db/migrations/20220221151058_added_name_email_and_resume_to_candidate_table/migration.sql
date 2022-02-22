/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Candidate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[jobId,email]` on the table `Candidate` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Candidate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Candidate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "resume" JSONB,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_slug_key" ON "Candidate"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_jobId_email_key" ON "Candidate"("jobId", "email");
