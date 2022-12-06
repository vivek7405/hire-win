import { Ctx } from "blitz"
import db, { Category, Prisma } from "db"
import { CategoryObj } from "src/categories/validations"
import Guard from "src/guard/ability"
import { ExtendedCategory } from "types"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"

type UpdateCategoryInput = Pick<Prisma.CategoryUpdateArgs, "where" | "data">

async function updateCategory({ where, data }: UpdateCategoryInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { name } = CategoryObj.parse(data)

  const slug = slugify(name, { strict: true, lower: true })
  // const newSlug = await findFreeSlug(
  //   slug,
  //   async (e) => await db.category.findFirst({ where: { slug: e } })
  // )

  const category = await db.category.update({
    where,
    data: {
      name,
      slug,
    },
  })

  return category
}

export default Guard.authorize("update", "category", updateCategory)
