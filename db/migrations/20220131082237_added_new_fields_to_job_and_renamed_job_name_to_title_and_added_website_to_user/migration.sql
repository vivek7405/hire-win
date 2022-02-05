/*
  Warnings:

  - You are about to drop the column `name` on the `Job` table. All the data in the column will be lost.
  - Added the required column `city` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxSalary` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minSalary` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remote` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salaryType` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY', 'INTERN', 'VOLUNTEER', 'PER_DIEM', 'OTHER');

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "name",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL,
ADD COLUMN     "employmentType" "EmploymentType"[],
ADD COLUMN     "maxSalary" INTEGER NOT NULL,
ADD COLUMN     "minSalary" INTEGER NOT NULL,
ADD COLUMN     "remote" BOOLEAN NOT NULL,
ADD COLUMN     "salaryType" "SalaryType" NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "validThrough" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "website" TEXT;
