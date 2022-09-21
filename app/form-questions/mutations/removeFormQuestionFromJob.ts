import { Ctx } from "blitz"
import db from "db"
import Guard from "app/guard/ability"

type RemoveQuestionFromFormInput = {
  jobId: string
  order: number
}

async function removeFormQuestionFromJob({ jobId, order }: RemoveQuestionFromFormInput, ctx: Ctx) {
  ctx.session.$authorize()

  // Get all questions with order greater than equal to the given order
  const formQuestions = await db.formQuestion.findMany({
    where: {
      jobId,
      order: {
        gte: order,
      },
    },
    orderBy: { order: "asc" },
  })

  if (formQuestions?.length > 0) {
    const deleteQuestion = await db.formQuestion.delete({
      where: {
        id: formQuestions[0]!.id,
      },
    })

    // Length will be 1 if it was the last question
    if (formQuestions.length > 1) {
      // First question is deleted so slice it off and get the remaining questions to reorder
      const formQuestionsToReorder = formQuestions.slice(1)

      formQuestionsToReorder.forEach((ws) => {
        ws.order -= 1
      })

      const updateFormQuestions = await db.formQuestion.updateMany({
        where: { id: jobId },
        data: formQuestionsToReorder?.map((ws) => {
          return {
            where: {
              id: ws.id,
            },
            data: {
              order: ws.order,
            },
          }
        }),
      })

      return [deleteQuestion, updateFormQuestions]
    }
  } else {
    throw new Error("Incorrect question details passed")
  }

  return null
}

export default removeFormQuestionFromJob
