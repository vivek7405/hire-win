import Guard from "app/guard/ability"
import { resolver, NotFoundError, Ctx } from "blitz"
import db, { Prisma } from "db"

// const GetScoreCard = z.object({
//   // This accepts type of undefined, but is required at runtime
//   slug: z.string().optional().refine(Boolean, "Required"),
// })

interface GetScoreCardInput extends Pick<Prisma.ScoreCardFindFirstArgs, "where"> {}

const getScoreCard = async ({ where }: GetScoreCardInput, ctx: Ctx) => {
  ctx.session.$authorize()

  const scoreCard = await db.scoreCard.findFirst({
    where,
    include: {
      cardQuestions: {
        include: {
          cardQuestion: true,
          scoreCard: { include: { jobWorkflowStages: true } },
          scores: { include: { candidate: true } },
        },
      },
    },
  })

  if (!scoreCard) throw new NotFoundError()

  return scoreCard
}

export default Guard.authorize("read", "scoreCard", getScoreCard)
