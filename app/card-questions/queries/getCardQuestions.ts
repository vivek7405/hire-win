import Guard from "app/guard/ability"
import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetCardQuestionsInput
  extends Pick<Prisma.CardQuestionFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

const getCardQuestions = resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetCardQuestionsInput) => {
    const {
      items: cardQuestions,
      hasMore,
      nextPage,
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
          include: {
            scoreCards: { include: { scoreCard: true } },
          },
        }),
    })

    return {
      cardQuestions,
      nextPage,
      hasMore,
      count,
    }
  }
)

export default Guard.authorize("readAll", "cardQuestion", getCardQuestions)
