import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetAnswersInput
  extends Pick<Prisma.AnswerFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getAnswers({ where, orderBy, skip = 0, take = 100 }: GetAnswersInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const {
    items: answers,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.answer.count({ where }),
    query: (paginateArgs) =>
      db.answer.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    answers,
    hasMore,
    count,
  }
}

export default getAnswers
