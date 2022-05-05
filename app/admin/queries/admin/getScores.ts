import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetScoresInput
  extends Pick<Prisma.ScoreFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getScores({ where, orderBy, skip = 0, take = 100 }: GetScoresInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const {
    items: scores,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.score.count({ where }),
    query: (paginateArgs) =>
      db.score.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    scores,
    hasMore,
    count,
  }
}

export default getScores
