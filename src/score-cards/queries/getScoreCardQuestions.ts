import { Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetScoreCardQuestionInput
  extends Pick<Prisma.ScoreCardQuestionFindManyArgs, "where" | "orderBy"> {}

async function getScoreCardQuestions({ where }: GetScoreCardQuestionInput, ctx: Ctx) {
  const scoreCardQuestions = db.scoreCardQuestion.findMany({
    where,
    orderBy: { order: "asc" },
    include: {
      scores: { include: { candidate: true } },
    },
  })

  return scoreCardQuestions
}

export default getScoreCardQuestions
