import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetInterviewsInput
  extends Pick<Prisma.InterviewFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getInterviews(
  { where, orderBy, skip = 0, take = 100 }: GetInterviewsInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: interviews,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.interview.count({ where }),
    query: (paginateArgs) =>
      db.interview.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    interviews,
    hasMore,
    count,
  }
}

export default getInterviews
