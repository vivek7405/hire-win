/*
  Warnings:

  - A unique constraint covering the columns `[createdById,name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Category_createdById_name_key" ON "Category"("createdById", "name");
