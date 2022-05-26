import db, { Prisma } from "db"

interface GetCategoriesInput extends Pick<Prisma.CategoryFindManyArgs, "where"> {}

const getCategoriesUnauthorized = async ({ where }: GetCategoriesInput) => {
  const categories = await db.category.findMany({
    where,
    include: { jobs: true },
  })
  return categories
}

export default getCategoriesUnauthorized
