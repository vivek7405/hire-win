/*
  Warnings:

  - The values [INVITE_TO_PARENT_COMPANY] on the enum `TokenType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TokenType_new" AS ENUM ('RESET_PASSWORD', 'INVITE_TO_COMPANY', 'INVITE_TO_JOB', 'PUBLIC_KEY', 'SECRET_KEY', 'CONFIRM_EMAIL');
ALTER TABLE "Token" ALTER COLUMN "type" TYPE "TokenType_new" USING ("type"::text::"TokenType_new");
ALTER TYPE "TokenType" RENAME TO "TokenType_old";
ALTER TYPE "TokenType_new" RENAME TO "TokenType";
DROP TYPE "TokenType_old";
COMMIT;
