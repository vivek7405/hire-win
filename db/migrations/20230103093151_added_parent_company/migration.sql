/*
  Warnings:

  - Added the required column `parentCompanyId` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ParentCompanyUserRole" AS ENUM ('OWNER', 'ADMIN', 'USER');

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "parentCompanyId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ParentCompanyUser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "ParentCompanyUserRole" NOT NULL,
    "userId" TEXT NOT NULL,
    "parentCompanyId" TEXT NOT NULL,

    CONSTRAINT "ParentCompanyUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentCompany" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ParentCompany_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParentCompanyUser_userId_parentCompanyId_key" ON "ParentCompanyUser"("userId", "parentCompanyId");

-- AddForeignKey
ALTER TABLE "ParentCompanyUser" ADD CONSTRAINT "ParentCompanyUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentCompanyUser" ADD CONSTRAINT "ParentCompanyUser_parentCompanyId_fkey" FOREIGN KEY ("parentCompanyId") REFERENCES "ParentCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_parentCompanyId_fkey" FOREIGN KEY ("parentCompanyId") REFERENCES "ParentCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
