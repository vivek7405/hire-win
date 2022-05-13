/*
  Warnings:

  - You are about to drop the column `htmlTemplate` on the `EmailTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `EmailTemplate` table. All the data in the column will be lost.
  - Added the required column `body` to the `EmailTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `EmailTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailTemplate" DROP COLUMN "htmlTemplate",
DROP COLUMN "name",
ADD COLUMN     "body" JSONB NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL;
