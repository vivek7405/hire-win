/*
  Warnings:

  - You are about to drop the column `company` on the `User` table. All the data in the column will be lost.
  - Added the required column `companyInfo` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "company",
ADD COLUMN     "companyInfo" TEXT NOT NULL,
ADD COLUMN     "companyName" TEXT NOT NULL;
