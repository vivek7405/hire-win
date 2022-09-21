-- CreateTable
CREATE TABLE "DefaultSchedule" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,

    CONSTRAINT "DefaultSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DefaultSchedule_userId_key" ON "DefaultSchedule"("userId");

-- AddForeignKey
ALTER TABLE "DefaultSchedule" ADD CONSTRAINT "DefaultSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultSchedule" ADD CONSTRAINT "DefaultSchedule_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
