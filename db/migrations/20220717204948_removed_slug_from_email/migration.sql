/*
  Warnings:

  - You are about to drop the column `slug` on the `Email` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Email_slug_key";

-- AlterTable
ALTER TABLE "Email" DROP COLUMN "slug";
