import { Ctx } from "blitz"
import db, { CouponGeneratedFor } from "db"
import Guard from "src/guard/ability"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"

type CouponInputType = {
  // Creates 100 Licenses if calue not provided
  numberOfCouponsToCreate?: number
  // License Tier 1 by default if value not provided
  licenseTier?: number
  generatedFor: CouponGeneratedFor
}
async function createCoupons(data: CouponInputType, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const arr: number[] = []
  for (var i = 0; i < (data.numberOfCouponsToCreate || 100); i++) {
    arr.push(i)
  }

  const coupons = await db.coupon.createMany({
    data: arr.map(() => {
      return { licenseTier: data.licenseTier, generatedFor: data.generatedFor }
    }),
  })

  return coupons
}

export default createCoupons
