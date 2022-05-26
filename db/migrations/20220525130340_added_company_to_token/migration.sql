/*
  Warnings:

  - The values [INVITE_TOKEN] on the enum `TokenType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TokenType_new" AS ENUM ('RESET_PASSWORD', 'INVITE_TO_COMPANY_TOKEN', 'INVITE_TO_JOB_TOKEN', 'PUBLIC_KEY', 'SECRET_KEY');
ALTER TABLE "Token" ALTER COLUMN "type" TYPE "TokenType_new" USING ("type"::text::"TokenType_new");
ALTER TYPE "TokenType" RENAME TO "TokenType_old";
ALTER TYPE "TokenType_new" RENAME TO "TokenType";
DROP TYPE "TokenType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "companyId" INTEGER;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
