import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetJobusersInput
  extends Pick<Prisma.JobUserFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getJobusers({ where, orderBy, skip = 0, take = 100 }: GetJobusersInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const {
    items: jobusers,
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
      }),
  })

  return {
    jobusers,
    hasMore,
    count,
  }
}

export default getJobusers
