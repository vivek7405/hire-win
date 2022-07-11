import db from "db"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import factoryCandidatePools from "../utils/factoryCandidatePools"

async function createFactoryCandidatePools(companyId: number) {
  const getSlug = async (q) => {
    const slug = slugify(q.name, { strict: true, lower: true })
    const newSlug = await findFreeSlug(
      slug,
      async (e) => await db.candidatePool.findFirst({ where: { slug: e } })
    )
    q.slug = newSlug
  }
  const promises = [] as any
  factoryCandidatePools.forEach(async (c) => {
    promises.push(getSlug(c))
  })
  await Promise.all(promises)

  const createCandidatePools = await db.candidatePool.createMany({
    data: factoryCandidatePools.map((c) => {
      return {
        createdAt: new Date(),
        updatedAt: new Date(),
        name: c.name,
        slug: c.slug,
        companyId,
      }
    }),
  })

  return createCandidatePools
}

export default createFactoryCandidatePools
