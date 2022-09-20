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
    companyId,
  }: GetJobsInput & {
    searchString: string
    categoryId: string | null
    companyId: string | null
  },
  ctx: Ctx
) {
  // ctx.session.$authorize()

  const validThrough = { gte: moment().utc().toDate() }

  const where = {
    archived: false,
    hidden: false,
    validThrough,
    companyId: companyId || "0",
    categoryId: categoryId || {},
    title: {
      contains: JSON.parse(searchString),
      mode: "insensitive",
    },
  } as any

  const {
    items: jobs,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.job.count({ where }),
    query: (paginateArgs) =>
      db.job.findMany({
        ...paginateArgs,
        where,
        orderBy,
        include: {
          category: true,
          candidates: true,
          stages: true,
          // workflow: { include: { stages: { include: { stage: true } } } },
        },
      }),
  })

  return {
    jobs,
    hasMore,
    count,
  }
}

export default getCompanyJobsForCareersPage
