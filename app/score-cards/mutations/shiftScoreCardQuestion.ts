import { Ctx } from "blitz"
import db from "db"
import Guard from "app/guard/ability"
import { ShiftDirection } from "types"
import range from "app/core/utils/range"

type ShiftScoreCardQuestionInput = {
  scoreCardId: string
  sourceOrder: number
  destOrder: number
}

async function shiftScoreCardQuestion(
  { scoreCardId, sourceOrder, destOrder }: ShiftScoreCardQuestionInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const scoreCardQuestions = await db.scoreCardQuestion.findMany({
    where: {
      scoreCardId: scoreCardId,
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

    const updateScoreCardQuestions = await db.scoreCard.update({
      where: { id: scoreCardId },
      data: {
        cardQuestions: {
          updateMany: scoreCardQuestions?.map((ws) => {
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
    return updateScoreCardQuestions
  } else {
    throw new Error("Order incorrect")
  }
}

export default Guard.authorize("update", "scoreCard", shiftScoreCardQuestion)
