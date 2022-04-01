import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"
import Guard from "app/guard/ability"

interface GetScoreCardQuestionInput
  extends Pick<Prisma.ScoreCardQuestionFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getScoreCardQuestions(
  { where, orderBy, skip = 0, take = 100 }: GetScoreCardQuestionInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const {
    items: scoreCardQuestions,
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
        orderBy: { order: "asc" },
        include: {
          cardQuestion: true,
        },
      }),
  })

  return {
    scoreCardQuestions,
    hasMore,
    count,
  }
}

export default Guard.authorize("readAll", "scoreCardQuestion", getScoreCardQuestions)
