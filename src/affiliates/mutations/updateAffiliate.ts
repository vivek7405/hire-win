import { Ctx } from "blitz"
import db, { Candidate, Affiliate, Prisma } from "db"
import Guard from "src/guard/ability"
// import { ExtendedAffiliate } from "types"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import { AffiliateObj } from "../validations"
import { z } from "zod"

type UpdateAffiliateInput = Pick<Prisma.AffiliateUpdateArgs, "where" | "data">

async function updateAffiliate({ where, data }: UpdateAffiliateInput, ctx: Ctx) {
  const { name } = z
    .object({
      name: z.string().nonempty({ message: "Name is required" }),
    })
    .parse(data)

  const affiliate = await db.affiliate.update({
    where,
    data: {
      name,
    },
  })

  return affiliate
}

export default updateAffiliate
