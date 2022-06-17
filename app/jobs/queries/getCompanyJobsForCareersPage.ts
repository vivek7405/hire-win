import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"
import Guard from "app/guard/ability"
import { JobViewType } from "types"
import moment from "moment"

interface GetJobsInput extends Pick<Prisma.JobUserFindManyArgs, "orderBy" | "skip" | "take"> {}

async function getCompanyJobsForCareersPage(
  {
    orderBy,
    skip = 0,
    take = 100,
    categoryId,
    searchString,
  }: GetJobsInput & {
    searchString: string
    categoryId: string | null
  },
  ctx: Ctx
) {
  // ctx.session.$authorize()

  const validThrough = { gte: moment().utc().toDate() }

  const where = {
    userId: ctx.session.userId || 0,
    job: {
      archived: false,
      validThrough,
      companyId: ctx.session.companyId || 0,
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
              workflow: { include: { stages: { include: { stage: true } } } },
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

export default getCompanyJobsForCareersPage
