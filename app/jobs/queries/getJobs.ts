import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"
import Guard from "app/guard/ability"

interface GetJobsInput
  extends Pick<Prisma.MembershipFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getJobs({ where, orderBy, skip = 0, take = 100 }: GetJobsInput, ctx: Ctx) {
  // ctx.session.$authorize()

  const {
    items: memberships,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.membership.count({ where }),
    query: (paginateArgs) =>
      db.membership.findMany({
        ...paginateArgs,
        where,
        orderBy,
        include: {
          job: {
            include: {
              category: true,
            },
          },
        },
      }),
  })

  return {
    memberships,
    hasMore,
    count,
  }
}

export default getJobs
