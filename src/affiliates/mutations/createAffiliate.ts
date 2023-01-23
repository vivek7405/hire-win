import { Ctx } from "blitz"
import db from "db"
import { AffiliateInputType, AffiliateObj } from "../validations"

async function createAffiliate(data: AffiliateInputType, ctx: Ctx) {
  const { name, email } = AffiliateObj.parse(data)

  const existingAffiliate = await db.affiliate.findUnique({
    where: { email },
  })

  if (existingAffiliate) return existingAffiliate

  const affiliate = await db.affiliate.create({
    data: { name, email },
  })

  return affiliate
}

export default createAffiliate
