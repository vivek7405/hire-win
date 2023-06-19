import { Ctx } from "blitz"
import db from "db"
import Guard from "src/guard/ability"

type RemoveCardQuestionFromScoreCardInput = {
  stageId: string
  scoreCardQuestionId: string
  slug: string
}

async function removeCardQuestionFromScoreCard(
  { stageId, scoreCardQuestionId, slug }: RemoveCardQuestionFromScoreCardInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const deletedScoreCardQuestion = await db.scoreCardQuestion.delete({
    where: { id: scoreCardQuestionId },
  })

  await db.scoreCardQuestion.updateMany({
    where: { stageId, order: { gt: deletedScoreCardQuestion.order } },
    data: { order: { decrement: 1 } },
  })

  return null
}

export default removeCardQuestionFromScoreCard
