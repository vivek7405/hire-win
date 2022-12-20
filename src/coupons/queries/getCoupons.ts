import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetCouponsInput extends Pick<Prisma.CouponFindManyArgs, "where"> {}

const getCoupons = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetCouponsInput, ctx: Ctx) => {
    const coupons = await db.coupon.findMany({
      where: { ...where },
      orderBy: { createdAt: "asc" },
    })
    return coupons
  }
)

export default getCoupons
