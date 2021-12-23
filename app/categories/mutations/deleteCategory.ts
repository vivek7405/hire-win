import { Ctx } from "blitz"
import db, { Prisma } from "db"
import Guard from "app/guard/ability"

type DeleteCategoryInput = Pick<Prisma.CategoryDeleteArgs, "where">

async function deleteCategory({ where }: DeleteCategoryInput, ctx: Ctx) {
  ctx.session.$authorize()

  const category = await db.category.delete({
    where,
  })

  return category
}

export default Guard.authorize("read", "category", deleteCategory)
