import { resolver } from "@blitzjs/rpc";
import Guard from "src/guard/ability"
import { Ctx } from "blitz";
import db, { Prisma } from "db"
import moment from "moment"
import { JobViewType } from "types"

// interface GetCategoriesInput extends Pick<Prisma.CategoryFindManyArgs, "where"> {}

type GetCategoriesInput = {
  searchString: string
  companyId: string | null
}
const getCompanyJobCategoriesForFilter = async (
  { searchString, companyId }: GetCategoriesInput,
  ctx: Ctx
) => {
  // const validThrough = { gte: moment().utc().toDate() }

  const categories = await db.category.findMany({
    where: {
      companyId: companyId || "0",
      jobs: {
        some: {
          archived: false,
          hidden: false,
          // validThrough,
          title: {
            contains: JSON.parse(searchString),
            mode: "insensitive",
          },
        },
      },
    },
    include: { jobs: { select: { id: true, archived: true } } },
    orderBy: { name: "asc" },
  })
  return categories
}

export default getCompanyJobCategoriesForFilter
