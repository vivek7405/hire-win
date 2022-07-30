/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `Interview` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Interview_eventId_key" ON "Interview"("eventId");
