/*
  Warnings:

  - A unique constraint covering the columns `[jobId,name]` on the table `Stage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Stage_jobId_name_key" ON "Stage"("jobId", "name");
