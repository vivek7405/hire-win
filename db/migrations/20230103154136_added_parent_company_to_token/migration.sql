/*
  Warnings:

  - You are about to drop the column `jobBoardName` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "parentCompanyId" TEXT,
ADD COLUMN     "parentCompanyUserRole" "ParentCompanyUserRole";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "jobBoardName";

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_parentCompanyId_fkey" FOREIGN KEY ("parentCompanyId") REFERENCES "ParentCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;
