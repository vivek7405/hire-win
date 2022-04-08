import Guard from "app/guard/ability"
import { resolver } from "blitz"
import db, { Prisma } from "db"

interface GetCardQuestionsInput extends Pick<Prisma.CardQuestionFindManyArgs, "where"> {}

const getCardQuestionsWOPagination = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetCardQuestionsInput) => {
    const cardQuestions = await db.cardQuestion.findMany({ where })
    return cardQuestions
  }
)

export default Guard.authorize("readAll", "cardQuestion", getCardQuestionsWOPagination)
