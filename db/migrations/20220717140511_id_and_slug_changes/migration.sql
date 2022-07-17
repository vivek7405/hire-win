/*
  Warnings:

  - The primary key for the `Calendar` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ownerId` on the `Calendar` table. All the data in the column will be lost.
  - The primary key for the `Company` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DailySchedule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DefaultCalendar` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Interview` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `JobUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Schedule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ownerId` on the `Schedule` table. All the data in the column will be lost.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Token` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,slug]` on the table `Calendar` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[jobId,slug]` on the table `Candidate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,slug]` on the table `CandidatePool` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,slug]` on the table `CardQuestion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,slug]` on the table `EmailTemplate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,slug]` on the table `Form` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,slug]` on the table `Job` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,slug]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,slug]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,slug]` on the table `ScoreCard` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,slug]` on the table `Stage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[companyId,slug]` on the table `Workflow` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Calendar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Calendar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Calendar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DailySchedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DefaultCalendar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Interview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Calendar" DROP CONSTRAINT "Calendar_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "CandidatePool" DROP CONSTRAINT "CandidatePool_companyId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateWorkflowStageInterviewer" DROP CONSTRAINT "CandidateWorkflowStageInterviewer_interviewerId_fkey";

-- DropForeignKey
ALTER TABLE "CardQuestion" DROP CONSTRAINT "CardQuestion_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyUser" DROP CONSTRAINT "CompanyUser_companyId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyUser" DROP CONSTRAINT "CompanyUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "DailySchedule" DROP CONSTRAINT "DailySchedule_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "DefaultCalendar" DROP CONSTRAINT "DefaultCalendar_calendarId_fkey";

-- DropForeignKey
ALTER TABLE "DefaultCalendar" DROP CONSTRAINT "DefaultCalendar_userId_fkey";

-- DropForeignKey
ALTER TABLE "Email" DROP CONSTRAINT "Email_senderId_fkey";

-- DropForeignKey
ALTER TABLE "EmailTemplate" DROP CONSTRAINT "EmailTemplate_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Form" DROP CONSTRAINT "Form_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_interviewerId_fkey";

-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_organizerId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewDetail" DROP CONSTRAINT "InterviewDetail_interviewerId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_companyId_fkey";

-- DropForeignKey
ALTER TABLE "JobUser" DROP CONSTRAINT "JobUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "JobUserScheduleCalendar" DROP CONSTRAINT "JobUserScheduleCalendar_calendarId_fkey";

-- DropForeignKey
ALTER TABLE "JobUserScheduleCalendar" DROP CONSTRAINT "JobUserScheduleCalendar_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "JobUserScheduleCalendar" DROP CONSTRAINT "JobUserScheduleCalendar_userId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "ScoreCard" DROP CONSTRAINT "ScoreCard_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "Stage" DROP CONSTRAINT "Stage_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_otherAttendeeInterviewId_fkey";

-- DropForeignKey
ALTER TABLE "Workflow" DROP CONSTRAINT "Workflow_companyId_fkey";

-- DropIndex
DROP INDEX "Calendar_ownerId_name_key";

-- DropIndex
DROP INDEX "Candidate_slug_key";

-- DropIndex
DROP INDEX "CandidatePool_companyId_name_key";

-- DropIndex
DROP INDEX "CandidatePool_slug_key";

-- DropIndex
DROP INDEX "CardQuestion_companyId_name_key";

-- DropIndex
DROP INDEX "CardQuestion_slug_key";

-- DropIndex
DROP INDEX "Category_companyId_name_key";

-- DropIndex
DROP INDEX "Category_slug_key";

-- DropIndex
DROP INDEX "EmailTemplate_companyId_subject_key";

-- DropIndex
DROP INDEX "EmailTemplate_slug_key";

-- DropIndex
DROP INDEX "Form_companyId_name_key";

-- DropIndex
DROP INDEX "Form_slug_key";

-- DropIndex
DROP INDEX "Job_slug_key";

-- DropIndex
DROP INDEX "Question_companyId_name_key";

-- DropIndex
DROP INDEX "Question_slug_key";

-- DropIndex
DROP INDEX "Schedule_ownerId_name_key";

-- DropIndex
DROP INDEX "ScoreCard_companyId_name_key";

-- DropIndex
DROP INDEX "ScoreCard_slug_key";

-- DropIndex
DROP INDEX "Stage_companyId_name_key";

-- DropIndex
DROP INDEX "Stage_slug_key";

-- DropIndex
DROP INDEX "Workflow_companyId_name_key";

-- DropIndex
DROP INDEX "Workflow_slug_key";

-- AlterTable
ALTER TABLE "Calendar" DROP CONSTRAINT "Calendar_pkey",
DROP COLUMN "ownerId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Calendar_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Calendar_id_seq";

-- AlterTable
ALTER TABLE "CandidatePool" ALTER COLUMN "companyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "CandidateWorkflowStageInterviewer" ALTER COLUMN "interviewerId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "CardQuestion" ALTER COLUMN "companyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "companyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "creatorId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Company" DROP CONSTRAINT "Company_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Company_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Company_id_seq";

-- AlterTable
ALTER TABLE "CompanyUser" ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "companyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "DailySchedule" DROP CONSTRAINT "DailySchedule_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "scheduleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "DailySchedule_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "DailySchedule_id_seq";

-- AlterTable
ALTER TABLE "DefaultCalendar" DROP CONSTRAINT "DefaultCalendar_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "calendarId" SET DATA TYPE TEXT,
ADD CONSTRAINT "DefaultCalendar_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "DefaultCalendar_id_seq";

-- AlterTable
ALTER TABLE "Email" ALTER COLUMN "senderId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "EmailTemplate" ALTER COLUMN "companyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Form" ALTER COLUMN "companyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "interviewerId" SET DATA TYPE TEXT,
ALTER COLUMN "organizerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Interview_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Interview_id_seq";

-- AlterTable
ALTER TABLE "InterviewDetail" ALTER COLUMN "interviewerId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "companyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "JobUser" DROP CONSTRAINT "JobUser_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "JobUser_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "JobUser_id_seq";

-- AlterTable
ALTER TABLE "JobUserScheduleCalendar" ALTER COLUMN "scheduleId" SET DATA TYPE TEXT,
ALTER COLUMN "calendarId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "companyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Schedule" DROP CONSTRAINT "Schedule_pkey",
DROP COLUMN "ownerId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Schedule_id_seq";

-- AlterTable
ALTER TABLE "ScoreCard" ALTER COLUMN "companyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Session" DROP CONSTRAINT "Session_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Session_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Session_id_seq";

-- AlterTable
ALTER TABLE "Stage" ALTER COLUMN "companyId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Token" DROP CONSTRAINT "Token_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "companyId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Token_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Token_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "otherAttendeeInterviewId" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "Workflow" ALTER COLUMN "companyId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Calendar_userId_slug_key" ON "Calendar"("userId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_jobId_slug_key" ON "Candidate"("jobId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "CandidatePool_companyId_slug_key" ON "CandidatePool"("companyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "CardQuestion_companyId_slug_key" ON "CardQuestion"("companyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_companyId_slug_key" ON "Category"("companyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_companyId_slug_key" ON "EmailTemplate"("companyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Form_companyId_slug_key" ON "Form"("companyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Job_companyId_slug_key" ON "Job"("companyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Question_companyId_slug_key" ON "Question"("companyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_userId_slug_key" ON "Schedule"("userId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreCard_companyId_slug_key" ON "ScoreCard"("companyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Stage_companyId_slug_key" ON "Stage"("companyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_companyId_slug_key" ON "Workflow"("companyId", "slug");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_otherAttendeeInterviewId_fkey" FOREIGN KEY ("otherAttendeeInterviewId") REFERENCES "Interview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUser" ADD CONSTRAINT "CompanyUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUser" ADD CONSTRAINT "CompanyUser_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewDetail" ADD CONSTRAINT "InterviewDetail_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobUserScheduleCalendar" ADD CONSTRAINT "JobUserScheduleCalendar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobUserScheduleCalendar" ADD CONSTRAINT "JobUserScheduleCalendar_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobUserScheduleCalendar" ADD CONSTRAINT "JobUserScheduleCalendar_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobUser" ADD CONSTRAINT "JobUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stage" ADD CONSTRAINT "Stage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Form" ADD CONSTRAINT "Form_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreCard" ADD CONSTRAINT "ScoreCard_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardQuestion" ADD CONSTRAINT "CardQuestion_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateWorkflowStageInterviewer" ADD CONSTRAINT "CandidateWorkflowStageInterviewer_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultCalendar" ADD CONSTRAINT "DefaultCalendar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultCalendar" ADD CONSTRAINT "DefaultCalendar_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "Calendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Calendar" ADD CONSTRAINT "Calendar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailySchedule" ADD CONSTRAINT "DailySchedule_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidatePool" ADD CONSTRAINT "CandidatePool_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
