import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetScorecardquestionsInput
  extends Pick<Prisma.ScoreCardQuestionFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getScorecardquestions(
  { where, orderBy, skip = 0, take = 100 }: GetScorecardquestionsInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: scorecardquestions,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.scoreCardQuestion.count({ where }),
    query: (paginateArgs) =>
      db.scoreCardQuestion.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    scorecardquestions,
    hasMore,
    count,
  }
}

export default getScorecardquestions
