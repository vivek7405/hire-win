import Guard from "app/guard/ability"
import { resolver, NotFoundError, Ctx } from "blitz"
import db, { Prisma } from "db"

// const GetScoreCard = z.object({
//   // This accepts type of undefined, but is required at runtime
//   slug: z.string().optional().refine(Boolean, "Required"),
// })

interface GetScoreCardInput extends Pick<Prisma.ScoreCardFindFirstArgs, "where"> {}

const getScoreCard = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetScoreCardInput, ctx: Ctx) => {
    const scoreCard = await db.scoreCard.findFirst({ where, include: { cardQuestions: true } })

    if (!scoreCard) throw new NotFoundError()

    return scoreCard
  }
)

export default Guard.authorize("read", "scoreCard", getScoreCard)
