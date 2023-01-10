import db from "db"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import factoryParentEmailTemplates from "../utils/factoryParentEmailTemplates"
import { Ctx } from "blitz"

type InputType = {
  parentCompanyId: string
}
async function createFactoryParentEmailTemplates({ parentCompanyId }: InputType, ctx: Ctx) {
  // const getSlug = async (q) => {
  //   const slug = slugify(q.name, { strict: true, lower: true })
  //   const newSlug = await findFreeSlug(
  //     slug,
  //     async (e) => await db.emailTemplate.findFirst({ where: { slug: e } })
  //   )
  //   q.slug = newSlug
  // }
  // const promises = [] as any
  // factoryParentEmailTemplates.forEach(async (c) => {
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
    factoryParentEmailTemplates.forEach(async (et) => {
      et.slug = slugify(et.name, { strict: true, lower: true })
    })

    await db.emailTemplate.createMany({
      data: factoryParentEmailTemplates.map((et) => {
        return {
          createdAt: new Date(),
          updatedAt: new Date(),
          name: et.name,
          slug: et.slug,
          subject: et.subject,
          body: et.body!,
          parentCompanyId,
          createdById: ctx.session.userId || "0",
        }
      }),
    })
  }
}

export default createFactoryParentEmailTemplates
