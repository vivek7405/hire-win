import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetInterviewdetailsInput
  extends Pick<Prisma.InterviewDetailFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getInterviewdetails(
  { where, orderBy, skip = 0, take = 100 }: GetInterviewdetailsInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: interviewdetails,
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
    interviewdetails,
    hasMore,
    count,
  }
}

export default getInterviewdetails
