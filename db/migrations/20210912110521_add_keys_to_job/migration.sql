-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TokenType" ADD VALUE 'PUBLIC_KEY';
ALTER TYPE "TokenType" ADD VALUE 'SECRET_KEY';

-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "jobId" TEXT,
ALTER COLUMN "sentTo" DROP NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Token" ADD FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
