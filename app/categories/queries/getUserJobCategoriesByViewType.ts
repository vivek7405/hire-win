import Guard from "app/guard/ability"
import { Ctx, resolver } from "blitz"
import db, { Prisma } from "db"
import moment from "moment"
import { JobViewType } from "types"

// interface GetCategoriesInput extends Pick<Prisma.CategoryFindManyArgs, "where"> {}

type GetCategoriesInput = {
  viewType: JobViewType
  searchString: string
}
const getUserJobCategoriesByViewType = resolver.pipe(
  resolver.authorize(),
  async ({ viewType, searchString }: GetCategoriesInput, ctx: Ctx) => {
    const todayDate = new Date(new Date().toDateString())
    const utcDateNow = moment().utc().toDate()
    // const validThrough = utcDateNow
    //   ? viewType === JobViewType.Expired
    //     ? { lt: utcDateNow }
    //     : { gte: utcDateNow }
    //   : todayDate

    const categories = await db.category.findMany({
      where: {
        companyId: ctx.session.companyId || "0",
        jobs: {
          some: {
            archived: viewType === JobViewType.Archived,
            // validThrough: viewType === JobViewType.Archived ? {} : validThrough,
            title: {
              contains: JSON.parse(searchString),
              mode: "insensitive",
            },
            users: {
              some: {
                userId: ctx.session.userId || "0",
              },
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

export default getUserJobCategoriesByViewType
