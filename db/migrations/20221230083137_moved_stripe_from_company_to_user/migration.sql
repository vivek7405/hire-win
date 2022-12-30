/*
  Warnings:

  - You are about to drop the column `stripeCurrentPeriodEnd` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `stripeTrialEnd` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `stripeTrialStart` on the `Company` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Company_stripeCustomerId_key";

-- DropIndex
DROP INDEX "Company_stripeSubscriptionId_key";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "stripeCurrentPeriodEnd",
DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripePriceId",
DROP COLUMN "stripeSubscriptionId",
DROP COLUMN "stripeTrialEnd",
DROP COLUMN "stripeTrialStart";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "stripeCurrentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripePriceId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "stripeTrialEnd" TIMESTAMP(3),
ADD COLUMN     "stripeTrialStart" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");
