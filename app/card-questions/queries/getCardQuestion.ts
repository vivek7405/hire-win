import Guard from "app/guard/ability"
import { resolver, NotFoundError } from "blitz"
import db, { Prisma } from "db"

interface GetCardQuestionInput extends Pick<Prisma.CardQuestionFindFirstArgs, "where"> {}

const getCardQuestion = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetCardQuestionInput, ctx) => {
    const cardQuestion = await db.cardQuestion.findFirst({
      where,
      include: { scoreCards: true },
    })

    if (!cardQuestion) throw new NotFoundError()

    return cardQuestion
  }
)

export default Guard.authorize("read", "cardQuestion", getCardQuestion)
