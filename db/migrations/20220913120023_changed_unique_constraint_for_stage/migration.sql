/*
  Warnings:

  - A unique constraint covering the columns `[jobId,order]` on the table `Stage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Stage_jobId_name_order_key";

-- CreateIndex
CREATE UNIQUE INDEX "Stage_jobId_order_key" ON "Stage"("jobId", "order");
