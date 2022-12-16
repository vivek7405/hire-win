import { Ctx, NotFoundError } from "blitz"
import db from "db"

type RedeemCouponInputType = {
  couponId: string
}
async function redeemCoupon({ couponId }: RedeemCouponInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const coupon = await db.coupon.findFirst({ where: { id: couponId } })

  if (coupon && !coupon.redeemedByUserId && !coupon.redemptionDate) {
    try {
      const coupon = await db.coupon.update({
        where: { id: couponId },
        data: {
          redeemedByUserId: ctx.session.userId,
          redemptionDate: new Date(),
        },
      })

      return coupon
    } catch (error) {
      throw new Error("Something went wrong while redeeming coupon")
    }
  } else {
    throw new NotFoundError("Invalid Coupon")
  }
}

export default redeemCoupon
