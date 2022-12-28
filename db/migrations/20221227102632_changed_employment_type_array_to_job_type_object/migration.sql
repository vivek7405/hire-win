/*
  Warnings:

  - You are about to drop the column `employmentType` on the `Job` table. All the data in the column will be lost.
  - Added the required column `jobType` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY', 'INTERN', 'VOLUNTEER', 'PER_DIEM', 'OTHER');

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "employmentType",
ADD COLUMN     "jobType" "JobType" NOT NULL;

-- DropEnum
DROP TYPE "EmploymentType";
