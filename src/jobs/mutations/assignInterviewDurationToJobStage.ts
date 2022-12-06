import { Ctx } from "blitz"
import db from "db"
import Guard from "src/guard/ability"

type InterviewDetailInputProps = {
  stageId: string
  interviewDuration: number
}

async function assignInterviewDurationToJobStage(
  { stageId, interviewDuration }: InterviewDetailInputProps,
  ctx: Ctx
) {
  ctx.session.$authorize()

  if (interviewDuration > 0) {
    const stage = await db.stage.update({
      where: { id: stageId },
      data: { duration: interviewDuration },
    })

    return stage
  } else {
    throw new Error("Invalid interview duration provided")
  }
}

export default assignInterviewDurationToJobStage
