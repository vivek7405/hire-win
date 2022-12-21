import { Ctx } from "blitz"
import db, { CouponGeneratedFor, CouponSet } from "db"
import Guard from "src/guard/ability"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"

type CouponInputType = {
  numberOfCouponsToCreate: number
  usdPrice: number
  couponSet: CouponSet
  generatedFor: CouponGeneratedFor
}
async function createCoupons(
  { numberOfCouponsToCreate, usdPrice, couponSet, generatedFor }: CouponInputType,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const arr: number[] = []
  for (var i = 0; i < (numberOfCouponsToCreate || 100); i++) {
    arr.push(i)
  }

  const coupons = await db.coupon.createMany({
    data: arr.map(() => {
      return { usdPrice, couponSet, generatedFor }
    }),
  })

  return coupons
}

export default createCoupons
