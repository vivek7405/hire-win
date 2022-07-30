import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetJobsInput
  extends Pick<Prisma.JobFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getJobs({ where, orderBy, skip = 0, take = 100 }: GetJobsInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

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
      }),
  })

  return {
    jobs,
    hasMore,
    count,
  }
}

export default getJobs
