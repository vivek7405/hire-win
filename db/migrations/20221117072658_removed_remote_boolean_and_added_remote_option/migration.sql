/*
  Warnings:

  - You are about to drop the column `remote` on the `Job` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RemoteOption" AS ENUM ('No_Remote', 'Remote_Friendly', 'Fully_Remote');

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "remote",
ADD COLUMN     "remoteOption" "RemoteOption" NOT NULL DEFAULT E'No_Remote';
