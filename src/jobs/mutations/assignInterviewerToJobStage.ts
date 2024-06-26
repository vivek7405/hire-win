import { Ctx } from "blitz"
import db from "db"
import Guard from "src/guard/ability"

type InterviewDetailInputProps = {
  stageId: string
  interviewerId: string
}

async function assignInterviewerToJobStage(
  { stageId, interviewerId }: InterviewDetailInputProps,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const interviewer = await db.user.findFirst({
    where: { id: interviewerId },
  })

  if (interviewer) {
    const stage = await db.stage.update({
      where: { id: stageId },
      data: { interviewerId },
    })

    return stage
  } else {
    throw new Error("Invalid interviewer id provided")
  }
}

export default assignInterviewerToJobStage
