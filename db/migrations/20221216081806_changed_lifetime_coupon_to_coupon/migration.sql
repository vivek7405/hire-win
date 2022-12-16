/*
  Warnings:

  - The `behaviour` column on the `FormQuestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `type` column on the `FormQuestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `employmentType` column on the `Job` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `salaryType` column on the `Job` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `remoteOption` column on the `Job` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `behaviour` column on the `ScoreCardQuestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `jobUserRole` column on the `Token` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `LifetimeCoupon` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `type` on the `Calendar` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `source` on the `Candidate` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `CandidateActivity` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role` on the `JobUser` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Token` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "LifetimeCoupon" DROP CONSTRAINT "LifetimeCoupon_redeemedByUserId_fkey";

-- AlterTable
ALTER TABLE "Calendar" DROP COLUMN "type",
ADD COLUMN     "type" "CalendarType" NOT NULL;

-- AlterTable
ALTER TABLE "Candidate" DROP COLUMN "source",
ADD COLUMN     "source" "CandidateSource" NOT NULL;

-- AlterTable
ALTER TABLE "CandidateActivity" DROP COLUMN "type",
ADD COLUMN     "type" "CandidateActivityType" NOT NULL;

-- AlterTable
ALTER TABLE "FormQuestion" DROP COLUMN "behaviour",
ADD COLUMN     "behaviour" "Behaviour" NOT NULL DEFAULT 'OPTIONAL',
DROP COLUMN "type",
ADD COLUMN     "type" "FormQuestionType" NOT NULL DEFAULT 'Single_line_text';

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "employmentType",
ADD COLUMN     "employmentType" "EmploymentType"[],
DROP COLUMN "salaryType",
ADD COLUMN     "salaryType" "SalaryType" NOT NULL DEFAULT 'YEAR',
DROP COLUMN "remoteOption",
ADD COLUMN     "remoteOption" "RemoteOption" NOT NULL DEFAULT 'No_Remote';

-- AlterTable
ALTER TABLE "JobUser" DROP COLUMN "role",
ADD COLUMN     "role" "JobUserRole" NOT NULL;

-- AlterTable
ALTER TABLE "ScoreCardQuestion" DROP COLUMN "behaviour",
ADD COLUMN     "behaviour" "Behaviour" NOT NULL DEFAULT 'OPTIONAL';

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "type",
ADD COLUMN     "type" "TokenType" NOT NULL,
DROP COLUMN "jobUserRole",
ADD COLUMN     "jobUserRole" "JobUserRole";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE "LifetimeCoupon";

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "licenseTier" INTEGER NOT NULL DEFAULT 1,
    "redemptionDate" TIMESTAMP(3),
    "redeemedByUserId" TEXT,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_hashedToken_type_key" ON "Token"("hashedToken", "type");

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_redeemedByUserId_fkey" FOREIGN KEY ("redeemedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
