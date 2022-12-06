import { Ctx } from "blitz"
import db from "db"
import Guard from "src/guard/ability"

type RemoveCardQuestionFromScoreCardInput = {
  stageId: string
  slug: string
}

async function removeCardQuestionFromScoreCard(
  { stageId, slug }: RemoveCardQuestionFromScoreCardInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const scoreCardQuestion = await db.scoreCardQuestion.findFirst({
    where: { slug },
  })

  // Get all cardQuestions with order greater than equal to the given order
  const scoreCardQuestions = await db.scoreCardQuestion.findMany({
    where: {
      stageId,
      order: {
        gte: scoreCardQuestion?.order || 0,
      },
    },
    orderBy: { order: "asc" },
  })

  if (scoreCardQuestions?.length > 0) {
    const deleteCardQuestion = await db.scoreCardQuestion.delete({
      where: {
        stageId_slug: {
          stageId,
          slug,
        },
      },
    })

    // Length will be 1 if it was the last cardQuestion
    if (scoreCardQuestions.length > 1) {
      // First cardQuestion is deleted so slice it off and get the remaining cardQuestions to reorder
      const scoreCardQuestionsToReorder = scoreCardQuestions.slice(1)

      scoreCardQuestionsToReorder.forEach((question) => {
        question.order -= 1
      })

      const updateScoreCardQuestionOrderBehaviours = await db.stage.update({
        where: { id: stageId },
        data: {
          scoreCardQuestions: {
            updateMany: scoreCardQuestionsToReorder?.map((question) => {
              return {
                where: {
                  id: question.id,
                },
                data: {
                  order: question.order,
                },
              }
            }),
          },
        },
      })
      return [deleteCardQuestion, updateScoreCardQuestionOrderBehaviours]
    }
  } else {
    throw new Error("Incorrect cardQuestion details passed")
  }

  return null
}

export default removeCardQuestionFromScoreCard
