import db from "db"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import factoryCandidatePools from "../utils/factoryCandidatePools"

async function createFactoryCandidatePools(companyId: string) {
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
      }
    }),
  })

  return createCandidatePools
}

export default createFactoryCandidatePools
