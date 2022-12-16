import { Ctx } from "blitz"
import db from "db"
import Guard from "src/guard/ability"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"

type CouponInputType = {
  // Creates 100 Licenses if calue not provided
  numberOfCouponsToCreate?: number
  // License Tier 1 by default if value not provided
  licenseTier?: number
}
async function createCoupons(data: CouponInputType, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const arr: number[] = []
  for (var i = 0; i < (data.numberOfCouponsToCreate || 100); i++) {
    arr.push(i)
  }

  const coupons = await db.coupon.createMany({
    data: arr.map((obj) => {
      return { licenseTier: data.licenseTier }
    }),
  })

  return coupons
}

export default createCoupons
