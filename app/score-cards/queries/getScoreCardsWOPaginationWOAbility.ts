import { resolver } from "blitz"
import db, { Prisma } from "db"

interface GetScoreCardsInput extends Pick<Prisma.ScoreCardFindManyArgs, "where"> {}

const getScoreCardsWOPaginationWOAbility = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetScoreCardsInput) => {
    const scoreCards = await db.scoreCard.findMany({
      where,
      include: {
        cardQuestions: { include: { cardQuestion: true }, orderBy: { order: "asc" } },
        jobWorkflowStages: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })
    return scoreCards
  }
)

export default getScoreCardsWOPaginationWOAbility
