/*
  Warnings:

  - You are about to drop the column `candidatePoolId` on the `CandidateActivity` table. All the data in the column will be lost.
  - You are about to drop the column `commentId` on the `CandidateActivity` table. All the data in the column will be lost.
  - You are about to drop the column `emailId` on the `CandidateActivity` table. All the data in the column will be lost.
  - You are about to drop the column `fileId` on the `CandidateActivity` table. All the data in the column will be lost.
  - You are about to drop the column `primaryInteractionUserId` on the `CandidateActivity` table. All the data in the column will be lost.
  - You are about to drop the column `primaryStageId` on the `CandidateActivity` table. All the data in the column will be lost.
  - You are about to drop the column `replyCommentId` on the `CandidateActivity` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryInteractionUserId` on the `CandidateActivity` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryStageId` on the `CandidateActivity` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CandidateActivity" DROP CONSTRAINT "CandidateActivity_candidatePoolId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateActivity" DROP CONSTRAINT "CandidateActivity_commentId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateActivity" DROP CONSTRAINT "CandidateActivity_emailId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateActivity" DROP CONSTRAINT "CandidateActivity_fileId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateActivity" DROP CONSTRAINT "CandidateActivity_primaryInteractionUserId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateActivity" DROP CONSTRAINT "CandidateActivity_primaryStageId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateActivity" DROP CONSTRAINT "CandidateActivity_replyCommentId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateActivity" DROP CONSTRAINT "CandidateActivity_secondaryInteractionUserId_fkey";

-- DropForeignKey
ALTER TABLE "CandidateActivity" DROP CONSTRAINT "CandidateActivity_secondaryStageId_fkey";

-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_candidateActivityId_fkey";

-- AlterTable
ALTER TABLE "CandidateActivity" DROP COLUMN "candidatePoolId",
DROP COLUMN "commentId",
DROP COLUMN "emailId",
DROP COLUMN "fileId",
DROP COLUMN "primaryInteractionUserId",
DROP COLUMN "primaryStageId",
DROP COLUMN "replyCommentId",
DROP COLUMN "secondaryInteractionUserId",
DROP COLUMN "secondaryStageId";
