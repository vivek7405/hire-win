/*
  Warnings:

  - A unique constraint covering the columns `[ownerId,name]` on the table `Calendar` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,subject]` on the table `EmailTemplate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerId,name]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Calendar_ownerId_name_key" ON "Calendar"("ownerId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_userId_subject_key" ON "EmailTemplate"("userId", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_ownerId_name_key" ON "Schedule"("ownerId", "name");
