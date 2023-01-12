/*
  Warnings:

  - A unique constraint covering the columns `[companyId,slug]` on the table `CandidatePool` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[parentCompanyId,slug]` on the table `CandidatePool` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,slug]` on the table `EmailTemplate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[parentCompanyId,slug]` on the table `EmailTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CandidatePool_companyId_parentCompanyId_slug_key";

-- DropIndex
DROP INDEX "EmailTemplate_companyId_parentCompanyId_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "CandidatePool_companyId_slug_key" ON "CandidatePool"("companyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "CandidatePool_parentCompanyId_slug_key" ON "CandidatePool"("parentCompanyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_companyId_slug_key" ON "EmailTemplate"("companyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_parentCompanyId_slug_key" ON "EmailTemplate"("parentCompanyId", "slug");
