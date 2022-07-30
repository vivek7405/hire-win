import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetQuestionsInput
  extends Pick<Prisma.QuestionFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getQuestions({ where, orderBy, skip = 0, take = 100 }: GetQuestionsInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const {
    items: questions,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.question.count({ where }),
    query: (paginateArgs) =>
      db.question.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    questions,
    hasMore,
    count,
  }
}

export default getQuestions
