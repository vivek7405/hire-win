/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `ParentCompany` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ParentCompany" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ParentCompany_slug_key" ON "ParentCompany"("slug");
