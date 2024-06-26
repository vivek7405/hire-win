import db from "db"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import factoryCategories from "../utils/factoryCategories"
import { closestIndexTo } from "date-fns"
import { Ctx } from "blitz"

async function createFactoryCategories(companyId: string, ctx: Ctx) {
  // const getSlug = async (q) => {
  //   const slug = slugify(q.name, { strict: true, lower: true })
  //   const newSlug = await findFreeSlug(
  //     slug,
  //     async (e) => await db.category.findFirst({ where: { slug: e } })
  //   )
  //   q.slug = newSlug
  // }
  // const promises = [] as any
  // factoryCategories.forEach(async (c) => {
  //   promises.push(getSlug(c))
  // })
  // await Promise.all(promises)

  factoryCategories.forEach(async (c) => {
    c.slug = slugify(c.name, { strict: true, lower: true })
  })

  const createCategories = await db.category.createMany({
    data: factoryCategories.map((c) => {
      return {
        createdAt: new Date(),
        updatedAt: new Date(),
        name: c.name,
        slug: c.slug,
        companyId,
        createdById: ctx.session.userId || "0",
      }
    }),
  })

  return createCategories
}

export default createFactoryCategories
