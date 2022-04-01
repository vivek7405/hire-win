import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import { ScoreCardQuestion, ScoreCardQuestionInputType } from "app/score-cards/validations"
import Guard from "app/guard/ability"

async function createScoreCardQuestion(data: ScoreCardQuestionInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { scoreCardId, cardQuestionId } = ScoreCardQuestion.parse(data)
  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const order = (await db.scoreCardQuestion.count({ where: { scoreCardId: scoreCardId } })) + 1

  const scoreCardQuestion = await db.scoreCardQuestion.create({
    data: {
      order: order,
      scoreCardId: scoreCardId!,
      cardQuestionId: cardQuestionId!,
    },
  })

  return scoreCardQuestion
}

export default Guard.authorize("create", "scoreCardQuestion", createScoreCardQuestion)
