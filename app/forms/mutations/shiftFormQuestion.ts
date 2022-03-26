import { Ctx } from "blitz"
import db from "db"
import Guard from "app/guard/ability"
import { ShiftDirection } from "types"
import range from "app/core/utils/range"

type ShiftFormQuestionInput = {
  formId: string
  sourceOrder: number
  destOrder: number
}

async function shiftFormQuestion(
  { formId, sourceOrder, destOrder }: ShiftFormQuestionInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const formQuestions = await db.formQuestion.findMany({
    where: {
      formId: formId,
      order: {
        in:
          sourceOrder < destOrder
            ? range(sourceOrder, destOrder, 1)
            : range(destOrder, sourceOrder, 1),
      },
    },
    orderBy: { order: "asc" },
  })

  const shiftDirection = sourceOrder < destOrder ? ShiftDirection.DOWN : ShiftDirection.UP
  if (formQuestions?.length === Math.abs(sourceOrder - destOrder) + 1) {
    formQuestions.forEach((fq) => {
      if (fq.order === sourceOrder) {
        fq.order = destOrder
      } else {
        shiftDirection === ShiftDirection.UP ? (fq.order += 1) : (fq.order -= 1)
      }
    })

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
