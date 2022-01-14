import { Ctx } from "blitz"
import db, { Prisma } from "db"
import { Category } from "app/categories/validations"
import Guard from "app/guard/ability"
import { ExtendedCategory } from "types"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type UpdateCategoryInput = Pick<Prisma.CategoryUpdateArgs, "where" | "data"> & {
  initial: ExtendedCategory
}

async function updateCategory({ where, data, initial }: UpdateCategoryInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { name } = Category.parse(data)

  const slug = slugify(name, { strict: true })
  const newSlug: string = await findFreeSlug(
    slug,
    async (e) => await db.category.findFirst({ where: { slug: e } })
  )

  const category = await db.category.update({
    where,
    data: {
      name,
      slug: initial.name !== name ? newSlug : initial.slug,
    },
  })

  return category
}

export default Guard.authorize("update", "category", updateCategory)
