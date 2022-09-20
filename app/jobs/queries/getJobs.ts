import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"
import Guard from "app/guard/ability"

interface GetJobsInput
  extends Pick<Prisma.JobUserFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getJobs({ where, orderBy, skip = 0, take = 100 }: GetJobsInput, ctx: Ctx) {
  // ctx.session.$authorize()

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

export default getJobs
