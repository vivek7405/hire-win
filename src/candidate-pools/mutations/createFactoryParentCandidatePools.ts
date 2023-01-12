import db from "db"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import factoryParentCandidatePools from "../utils/factoryParentCandidatePools"
import { closestIndexTo } from "date-fns"
import { Ctx } from "blitz"

type InputType = {
  parentCompanyId: string
}
async function createFactoryParentCandidatePools({ parentCompanyId }: InputType, ctx: Ctx) {
  // const getSlug = async (q) => {
  //   const slug = slugify(q.name, { strict: true, lower: true })
  //   const newSlug = await findFreeSlug(
  //     slug,
  //     async (e) => await db.parentCandidatePool.findFirst({ where: { slug: e } })
  //   )
  //   q.slug = newSlug
  // }
  // const promises = [] as any
  // factoryParentCandidatePools.forEach(async (c) => {
  //   promises.push(getSlug(c))
  // })
  // await Promise.all(promises)

  let isFirstSubCompanyUnderParentCompany = false
  const parentCompany = await db.parentCompany.findUnique({
    where: { id: parentCompanyId },
    include: { _count: { select: { companies: true } } },
  })
  if (parentCompany?._count?.companies === 1) {
    isFirstSubCompanyUnderParentCompany = true
  }

  if (isFirstSubCompanyUnderParentCompany) {
    factoryParentCandidatePools.forEach((cp) => {
      cp.slug = slugify(cp.name, { strict: true, lower: true })
    })

    await db.candidatePool.createMany({
      data: factoryParentCandidatePools.map((cp) => {
        return {
          createdAt: new Date(),
          updatedAt: new Date(),
          name: cp.name,
          slug: cp.slug,
          parentCompanyId,
          createdById: ctx.session.userId || "0",
        }
      }),
    })
  }
}

export default createFactoryParentCandidatePools
