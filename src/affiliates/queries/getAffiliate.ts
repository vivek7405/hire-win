import { resolver } from "@blitzjs/rpc"
import Guard from "src/guard/ability"
import { Ctx, NotFoundError } from "blitz"
import { closestIndexTo } from "date-fns"
import db, { Prisma } from "db"

interface GetAffiliateInput extends Pick<Prisma.AffiliateFindFirstArgs, "where"> {}

const getAffiliate = async ({ where }: GetAffiliateInput, ctx: Ctx) => {
  const affiliate = await db.affiliate.findFirst({
    where,
    include: { referredUsers: true },
  })

  return affiliate
}

export default getAffiliate
