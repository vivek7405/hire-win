import db from "db"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import factoryCategories from "../utils/factoryCategories"

async function createFactoryCategories(companyId: number) {
  const getSlug = async (q) => {
    const slug = slugify(q.name, { strict: true })
    const newSlug = await findFreeSlug(
      slug,
      async (e) => await db.category.findFirst({ where: { slug: e } })
    )
    q.slug = newSlug
  }
  const promises = [] as any
  factoryCategories.forEach(async (c) => {
    promises.push(getSlug(c))
  })
  await Promise.all(promises)

  const createCategories = await db.category.createMany({
    data: factoryCategories.map((c) => {
      return {
        createdAt: new Date(),
        updatedAt: new Date(),
        name: c.name,
        slug: c.slug,
        companyId,
      }
    }),
  })

  return createCategories
}

export default createFactoryCategories
