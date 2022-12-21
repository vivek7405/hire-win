-- CreateEnum
CREATE TYPE "CouponGeneratedFor" AS ENUM ('SELF', 'APP_SUMO');

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "generatedFor" "CouponGeneratedFor" NOT NULL DEFAULT 'SELF';
