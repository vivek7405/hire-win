import Guard from "app/guard/ability"
import { Ctx, resolver } from "blitz"
import db, { Prisma } from "db"
import moment from "moment"
import { JobViewType } from "types"

// interface GetCategoriesInput extends Pick<Prisma.CategoryFindManyArgs, "where"> {}

type GetCategoriesInput = {
  searchString: string
}
const getCompanyJobCategoriesForFilter = resolver.pipe(
  resolver.authorize(),
  async ({ searchString }: GetCategoriesInput, ctx: Ctx) => {
    const validThrough = { gte: moment().utc().toDate() }

    const categories = await db.category.findMany({
      where: {
        companyId: ctx.session.companyId || 0,
        jobs: {
          some: {
            archived: false,
            validThrough,
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
)

export default getCompanyJobCategoriesForFilter
