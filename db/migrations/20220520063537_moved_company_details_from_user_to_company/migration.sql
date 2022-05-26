/*
  Warnings:

  - You are about to drop the column `companyInfo` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_slug_key";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "info" JSONB,
ADD COLUMN     "logo" JSONB,
ADD COLUMN     "theme" TEXT DEFAULT E'indigo',
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "companyInfo",
DROP COLUMN "companyName",
DROP COLUMN "logo",
DROP COLUMN "slug",
DROP COLUMN "theme",
DROP COLUMN "website";
