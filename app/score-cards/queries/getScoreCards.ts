import Guard from "app/guard/ability"
import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetScoreCardsInput
  extends Pick<Prisma.ScoreCardFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

const getScoreCards = resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetScoreCardsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: scoreCards,
      hasMore,
      nextPage,
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
          include: {
            cardQuestions: { include: { cardQuestion: true } },
            jobWorkflowStages: true,
          },
        }),
    })

    return {
      scoreCards,
      nextPage,
      hasMore,
      count,
    }
  }
)

export default Guard.authorize("readAll", "scoreCard", getScoreCards)
