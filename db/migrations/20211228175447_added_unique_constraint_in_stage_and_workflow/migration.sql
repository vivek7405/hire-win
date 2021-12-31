/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Stage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,name]` on the table `Workflow` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Stage_userId_name_key" ON "Stage"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_userId_name_key" ON "Workflow"("userId", "name");
