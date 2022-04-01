import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import { ScoreCardQuestions, ScoreCardQuestionsInputType } from "app/score-cards/validations"
import Guard from "app/guard/ability"

async function addExistingScoreCardQuestions(data: ScoreCardQuestionsInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { scoreCardId, cardQuestionIds } = ScoreCardQuestions.parse(data)
  const user = await db.user.findFirst({ where: { id: ctx.session.userId! } })
  if (!user) throw new AuthenticationError()

  const order = (await db.scoreCardQuestion.count({ where: { scoreCardId: scoreCardId } })) + 1

  // const scoreCardQuestion = await db.scoreCardQuestion.create({
  //   data: {
  //     order: order,
  //     scoreCardId: scoreCardId!,
  //     cardQuestionId: cardQuestionId!,
  //   },
  // })

  const scoreCard = await db.scoreCard.update({
    where: { id: scoreCardId },
    data: {
      cardQuestions: {
        createMany: {
          data: cardQuestionIds.map((qId, index) => {
            return {
              order: order + index,
              cardQuestionId: qId,
            }
          }),
        },
      },
    },
  })

  return scoreCard
}

export default Guard.authorize("create", "scoreCardQuestion", addExistingScoreCardQuestions)
