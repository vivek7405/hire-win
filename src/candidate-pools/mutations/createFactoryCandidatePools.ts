import db from "db"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import factoryCandidatePools from "../utils/factoryCandidatePools"
import { closestIndexTo } from "date-fns"
import { Ctx } from "blitz"

type InputType = {
  companyId: string
}
async function createFactoryCandidatePools({ companyId }: InputType, ctx: Ctx) {
  // const getSlug = async (q) => {
  //   const slug = slugify(q.name, { strict: true, lower: true })
  //   const newSlug = await findFreeSlug(
  //     slug,
  //     async (e) => await db.candidatePool.findFirst({ where: { slug: e } })
  //   )
  //   q.slug = newSlug
  // }
  // const promises = [] as any
  // factoryCandidatePools.forEach(async (c) => {
  //   promises.push(getSlug(c))
  // })
  // await Promise.all(promises)

  factoryCandidatePools.forEach((cp) => {
    cp.slug = slugify(cp.name, { strict: true, lower: true })
  })

  const createCandidatePools = await db.candidatePool.createMany({
    data: factoryCandidatePools.map((cp) => {
      return {
        createdAt: new Date(),
        updatedAt: new Date(),
        name: cp.name,
        slug: cp.slug,
        companyId,
        createdById: ctx.session.userId || "0",
      }
    }),
  })

  return createCandidatePools
}

export default createFactoryCandidatePools
