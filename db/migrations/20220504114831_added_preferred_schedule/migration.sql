-- CreateTable
CREATE TABLE "PreferredSchedule" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "scheduleId" INTEGER NOT NULL,

    CONSTRAINT "PreferredSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreferredSchedule_userId_key" ON "PreferredSchedule"("userId");

-- AddForeignKey
ALTER TABLE "PreferredSchedule" ADD CONSTRAINT "PreferredSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreferredSchedule" ADD CONSTRAINT "PreferredSchedule_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
