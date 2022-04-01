import Guard from "app/guard/ability"
import { resolver } from "blitz"
import db, { Prisma } from "db"

interface GetScoreCardsInput extends Pick<Prisma.ScoreCardFindManyArgs, "where"> {}

const getScoreCardsWOPagination = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetScoreCardsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const scoreCards = await db.scoreCard.findMany({
      where,
      include: {
        cardQuestions: { include: { cardQuestion: true } },
        jobWorkflowStages: true,
      },
    })
    return scoreCards
  }
)

export default Guard.authorize("readAll", "scoreCard", getScoreCardsWOPagination)
