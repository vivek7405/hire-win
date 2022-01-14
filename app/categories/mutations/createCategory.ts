import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import { Category, CategoryInputType } from "app/categories/validations"
import Guard from "app/guard/ability"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

async function createCategory(data: CategoryInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { name } = Category.parse(data)
  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const slug = slugify(name, { strict: true })
  const newSlug = await findFreeSlug(
    slug,
    async (e) => await db.category.findFirst({ where: { slug: e } })
  )

  const category = await db.category.create({
    data: {
      name: name,
      slug: newSlug,
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  })

  return category
}

export default Guard.authorize("create", "category", createCategory)
