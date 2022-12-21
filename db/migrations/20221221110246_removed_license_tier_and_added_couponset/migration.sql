/*
  Warnings:

  - You are about to drop the column `licenseTier` on the `Coupon` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CouponSet" AS ENUM ('SET_1');

-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "licenseTier",
ADD COLUMN     "couponSet" "CouponSet" NOT NULL DEFAULT 'SET_1';
