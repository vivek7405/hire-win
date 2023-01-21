import { Ctx, NotFoundError } from "blitz"
import db from "db"
import { AffiliateInputType, AffiliateObj } from "../validations"

type AssignAffiliateToUserInputType = {
  affiliateId: string
  userId: string
}

async function assignAffiliateToUser(
  { affiliateId, userId }: AssignAffiliateToUserInputType,
  ctx: Ctx
) {
  const user = await db.user.findUnique({
    where: { id: userId },
  })

  if (!user) throw new NotFoundError("User with provided id not found")

  const affiliate = await db.affiliate.findUnique({
    where: { id: affiliateId },
  })

  if (!affiliate) throw new NotFoundError("Affiliate with provided id not found")

  // User can't be a referrer for themselves
  if (user?.email !== affiliate?.email) {
    await db.user.update({
      where: { id: userId },
      data: {
        referredByAffiliateId: affiliateId,
      },
    })
  }
}

export default assignAffiliateToUser
