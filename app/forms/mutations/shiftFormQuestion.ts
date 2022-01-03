import { Ctx } from "blitz"
import db from "db"
import Guard from "app/guard/ability"
import { ShiftDirection } from "types"

type ShiftFormQuestionInput = {
  formId: string
  order: number
  shiftDirection: ShiftDirection
}

async function shiftFormQuestion(
  { formId, order, shiftDirection }: ShiftFormQuestionInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const formQuestions = await db.formQuestion.findMany({
    where: {
      formId: formId,
      order: {
        in: shiftDirection === ShiftDirection.UP ? [order, order - 1] : [order, order + 1],
      },
    },
    orderBy: { order: "asc" },
  })

  if (formQuestions?.length === 2) {
    formQuestions[0]!.order += 1
    formQuestions[1]!.order -= 1

    const updateFormQuestions = await db.form.update({
      where: { id: formId },
      data: {
        questions: {
          updateMany: formQuestions?.map((ws) => {
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
    return updateFormQuestions
  } else {
    throw new Error("Order incorrect")
  }
}

export default Guard.authorize("update", "form", shiftFormQuestion)
