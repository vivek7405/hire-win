import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import { CategoryObj, CategoryInputType } from "app/categories/validations"
import Guard from "app/guard/ability"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

async function createCategory(data: CategoryInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { name } = CategoryObj.parse(data)
  // const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  // if (!user) throw new AuthenticationError()

  const slug = slugify(name, { strict: true, lower: true })
  // const newSlug = await findFreeSlug(
  //   slug,
  //   async (e) => await db.category.findFirst({ where: { slug: e } })
  // )

  const category = await db.category.create({
    data: {
      name: name,
      slug,
      company: {
        connect: {
          id: ctx.session.companyId || "0",
        },
      },
    },
  })

  return category
}

export default Guard.authorize("create", "category", createCategory)
