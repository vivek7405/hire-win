import { Ctx, paginate } from "blitz"
import db, { Prisma } from "db"
import Guard from "src/guard/ability"
import { JobViewType } from "types"
import moment from "moment"

interface GetJobsInput extends Pick<Prisma.JobUserFindManyArgs, "orderBy" | "skip" | "take"> {}

async function getUserJobsByViewTypeAndCategory(
  {
    orderBy,
    skip = 0,
    take = 100,
    viewType,
    categoryId,
    searchString,
  }: GetJobsInput & {
    searchString: string
    viewType: JobViewType
    categoryId: string | null
  },
  ctx: Ctx
) {
  // ctx.session.$authorize()

  const todayDate = new Date(new Date().toDateString())
  const utcDateNow = moment().utc().toDate()
  // const validThrough = utcDateNow
  //   ? viewType === JobViewType.Expired
  //     ? { lt: utcDateNow }
  //     : { gte: utcDateNow }
  //   : todayDate

  const where = {
    userId: ctx.session.userId || 0,
    job: {
      archived: viewType === JobViewType.Archived,
      // validThrough: viewType === JobViewType.Archived ? {} : validThrough,
      companyId: ctx.session.companyId || "0",
      categoryId: categoryId || {},
      title: {
        contains: JSON.parse(searchString),
        mode: "insensitive",
      },
    },
  } as any

  const {
    items: jobUsers,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.jobUser.count({ where }),
    query: (paginateArgs) =>
      db.jobUser.findMany({
        ...paginateArgs,
        where,
        orderBy,
        include: {
          job: {
            include: {
              category: true,
              candidates: true,
              stages: true,
              createdBy: true,
              company: true,
              // workflow: { include: { stages: { include: { stage: true } } } },
            },
          },
        },
      }),
  })

  return {
    jobUsers,
    hasMore,
    count,
  }
}

export default getUserJobsByViewTypeAndCategory
