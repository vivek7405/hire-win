import db, { Prisma } from "db"

interface GetCategoriesInput extends Pick<Prisma.CategoryFindManyArgs, "where"> {}

const getCategoriesUnauthorized = async ({ where }: GetCategoriesInput) => {
  const categories = await db.category.findMany({
    where,
    include: { jobs: { include: { _count: { select: { candidates: true } } } } },
  })
  return categories
}

export default getCategoriesUnauthorized
