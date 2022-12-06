import db from "db"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import factoryEmailTemplates from "../utils/factoryEmailTemplates"
import { Ctx } from "blitz"

type InputType = {
  companyId: string
}
async function createFactoryEmailTemplates({ companyId }: InputType, ctx: Ctx) {
  // const getSlug = async (q) => {
  //   const slug = slugify(q.name, { strict: true, lower: true })
  //   const newSlug = await findFreeSlug(
  //     slug,
  //     async (e) => await db.emailTemplate.findFirst({ where: { slug: e } })
  //   )
  //   q.slug = newSlug
  // }
  // const promises = [] as any
  // factoryEmailTemplates.forEach(async (c) => {
  //   promises.push(getSlug(c))
  // })
  // await Promise.all(promises)

  factoryEmailTemplates.forEach(async (et) => {
    et.slug = slugify(et.name, { strict: true, lower: true })
  })

  const createEmailTemplates = await db.emailTemplate.createMany({
    data: factoryEmailTemplates.map((et) => {
      return {
        createdAt: new Date(),
        updatedAt: new Date(),
        name: et.name,
        slug: et.slug,
        subject: et.subject,
        body: et.body!,
        companyId,
        createdById: ctx.session.userId || "0",
      }
    }),
  })

  return createEmailTemplates
}

export default createFactoryEmailTemplates
