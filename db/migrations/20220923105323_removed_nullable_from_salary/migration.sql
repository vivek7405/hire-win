/*
  Warnings:

  - Made the column `currency` on table `Job` required. This step will fail if there are existing NULL values in that column.
  - Made the column `maxSalary` on table `Job` required. This step will fail if there are existing NULL values in that column.
  - Made the column `minSalary` on table `Job` required. This step will fail if there are existing NULL values in that column.
  - Made the column `salaryType` on table `Job` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "currency" SET NOT NULL,
ALTER COLUMN "maxSalary" SET NOT NULL,
ALTER COLUMN "minSalary" SET NOT NULL,
ALTER COLUMN "salaryType" SET NOT NULL;
