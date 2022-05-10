import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetCardquestionsInput
  extends Pick<Prisma.CardQuestionFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getCardquestions(
  { where, orderBy, skip = 0, take = 100 }: GetCardquestionsInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: cardquestions,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.cardQuestion.count({ where }),
    query: (paginateArgs) =>
      db.cardQuestion.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    cardquestions,
    hasMore,
    count,
  }
}

export default getCardquestions
