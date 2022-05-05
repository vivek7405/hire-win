import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetScorecardsInput
  extends Pick<Prisma.ScoreCardFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getScorecards(
  { where, orderBy, skip = 0, take = 100 }: GetScorecardsInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: scorecards,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.scoreCard.count({ where }),
    query: (paginateArgs) =>
      db.scoreCard.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    scorecards,
    hasMore,
    count,
  }
}

export default getScorecards
