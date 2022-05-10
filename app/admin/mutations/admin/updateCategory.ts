import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateCategoryInput = Pick<Prisma.CategoryUpdateArgs, "where" | "data">

async function updateCategory({ where, data }: UpdateCategoryInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const category = await db.category.update({
    where,
    data,
  })

  return category
}

export default updateCategory
