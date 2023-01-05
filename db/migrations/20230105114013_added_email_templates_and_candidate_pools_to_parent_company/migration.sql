-- DropForeignKey
ALTER TABLE "CandidatePool" DROP CONSTRAINT "CandidatePool_companyId_fkey";

-- DropForeignKey
ALTER TABLE "EmailTemplate" DROP CONSTRAINT "EmailTemplate_companyId_fkey";

-- AlterTable
ALTER TABLE "CandidatePool" ADD COLUMN     "parentCompanyId" TEXT,
ALTER COLUMN "companyId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "EmailTemplate" ADD COLUMN     "parentCompanyId" TEXT,
ALTER COLUMN "companyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_parentCompanyId_fkey" FOREIGN KEY ("parentCompanyId") REFERENCES "ParentCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidatePool" ADD CONSTRAINT "CandidatePool_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidatePool" ADD CONSTRAINT "CandidatePool_parentCompanyId_fkey" FOREIGN KEY ("parentCompanyId") REFERENCES "ParentCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;
