import { Ctx } from "blitz"
import db from "db"
import Guard from "app/guard/ability"

type RemoveQuestionFromFormInput = {
  formId: string
  order: number
}

async function removeQuestionFromForm({ formId, order }: RemoveQuestionFromFormInput, ctx: Ctx) {
  ctx.session.$authorize()

  // Get all questions with order greater than equal to the given order
  const formQuestions = await db.formQuestion.findMany({
    where: {
      formId: formId,
      order: {
        gte: order,
      },
    },
    orderBy: { order: "asc" },
  })

  if (formQuestions?.length > 0) {
    const deleteQuestion = await db.formQuestion.delete({
      where: {
        formId_questionId_order: {
          formId: formId,
          questionId: formQuestions[0]!.questionId,
          order: order,
        },
      },
    })

    // Length will be 1 if it was the last question
    if (formQuestions.length > 1) {
      // First question is deleted so slice it off and get the remaining questions to reorder
      const formQuestionsToReorder = formQuestions.slice(1)

      formQuestionsToReorder.forEach((ws) => {
        ws.order -= 1
      })

      const updateFormQuestions = await db.form.update({
        where: { id: formId },
        data: {
          questions: {
            updateMany: formQuestionsToReorder?.map((ws) => {
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
      return [deleteQuestion, updateFormQuestions]
    }
  } else {
    throw new Error("Incorrect question details passed")
  }

  return null
}

export default Guard.authorize("update", "form", removeQuestionFromForm)
