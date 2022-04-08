import { Ctx } from "blitz"
import db from "db"
import Guard from "app/guard/ability"

type RemoveCardQuestionFromScoreCardInput = {
  scoreCardId: string
  order: number
}

async function removeCardQuestionFromScoreCard(
  { scoreCardId, order }: RemoveCardQuestionFromScoreCardInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  // Get all cardQuestions with order greater than equal to the given order
  const scoreCardQuestions = await db.scoreCardQuestion.findMany({
    where: {
      scoreCardId: scoreCardId,
      order: {
        gte: order,
      },
    },
    orderBy: { order: "asc" },
  })

  if (scoreCardQuestions?.length > 0) {
    const deleteCardQuestion = await db.scoreCardQuestion.delete({
      where: {
        scoreCardId_cardQuestionId_order: {
          scoreCardId: scoreCardId,
          cardQuestionId: scoreCardQuestions[0]!.cardQuestionId,
          order: order,
        },
      },
    })

    // Length will be 1 if it was the last cardQuestion
    if (scoreCardQuestions.length > 1) {
      // First cardQuestion is deleted so slice it off and get the remaining cardQuestions to reorder
      const scoreCardQuestionsToReorder = scoreCardQuestions.slice(1)

      scoreCardQuestionsToReorder.forEach((ws) => {
        ws.order -= 1
      })

      const updateScoreCardQuestions = await db.scoreCard.update({
        where: { id: scoreCardId },
        data: {
          cardQuestions: {
            updateMany: scoreCardQuestionsToReorder?.map((ws) => {
              return {
                where: {
                  id: ws.id,
                },
                data: {
                  order: ws.order,
                },
              }
            }),
          },
        },
      })
      return [deleteCardQuestion, updateScoreCardQuestions]
    }
  } else {
    throw new Error("Incorrect cardQuestion details passed")
  }

  return null
}

export default Guard.authorize("update", "scoreCard", removeCardQuestionFromScoreCard)
