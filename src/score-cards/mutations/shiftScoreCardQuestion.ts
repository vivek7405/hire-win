import { Ctx } from "blitz"
import db from "db"
import Guard from "src/guard/ability"
import { ShiftDirection } from "types"
import range from "src/core/utils/range"

type ShiftScoreCardQuestionInput = {
  stageId: string
  sourceOrder: number
  destOrder: number
}

async function shiftScoreCardQuestion(
  { stageId, sourceOrder, destOrder }: ShiftScoreCardQuestionInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const scoreCardQuestions = await db.scoreCardQuestion.findMany({
    where: {
      stageId,
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
  if (scoreCardQuestions?.length === Math.abs(sourceOrder - destOrder) + 1) {
    scoreCardQuestions.forEach((fq) => {
      if (fq.order === sourceOrder) {
        fq.order = destOrder
      } else {
        shiftDirection === ShiftDirection.UP ? (fq.order += 1) : (fq.order -= 1)
      }
    })

    const updateScoreCardQuestionOrderBehaviours = await db.stage.update({
      where: { id: stageId },
      data: {
        scoreCardQuestions: {
          updateMany: scoreCardQuestions?.map((question) => {
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
    return updateScoreCardQuestionOrderBehaviours
  } else {
    throw new Error("Order incorrect")
  }
}

export default shiftScoreCardQuestion
