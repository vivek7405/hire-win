import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetInterviewDetailsInput
  extends Pick<Prisma.InterviewDetailFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getInterviewDetails(
  { where, orderBy, skip = 0, take = 100 }: GetInterviewDetailsInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: interviewDetails,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.interviewDetail.count({ where }),
    query: (paginateArgs) =>
      db.interviewDetail.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    interviewDetails,
    hasMore,
    count,
  }
}

export default getInterviewDetails
