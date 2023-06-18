import { Ctx } from "blitz"
import db from "db"
import Guard from "src/guard/ability"

type RemoveQuestionFromFormInput = {
  jobId: string
  formQuestionId: string
}

async function removeFormQuestionFromJob(
  { jobId, formQuestionId }: RemoveQuestionFromFormInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const deletedFormQuestion = await db.formQuestion.delete({
    where: { id: formQuestionId },
  })

  await db.formQuestion.updateMany({
    where: { jobId, order: { gt: deletedFormQuestion.order } },
    data: { order: { decrement: 1 } },
  })

  return null
}

export default removeFormQuestionFromJob
