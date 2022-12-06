import { Ctx } from "blitz"
import db from "db"
import Guard from "src/guard/ability"
import { ShiftDirection } from "types"
import range from "src/core/utils/range"

type ShiftFormQuestionInput = {
  jobId: string
  sourceOrder: number
  destOrder: number
}

async function shiftFormQuestion(
  { jobId, sourceOrder, destOrder }: ShiftFormQuestionInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const formQuestions = await db.formQuestion.findMany({
    where: {
      jobId,
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

    const updateFormQuestions = await db.job.update({
      where: { id: jobId },
      data: {
        formQuestions: {
          updateMany: formQuestions?.map((question) => {
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

    return updateFormQuestions
  } else {
    throw new Error("Order incorrect")
  }
}

export default shiftFormQuestion
