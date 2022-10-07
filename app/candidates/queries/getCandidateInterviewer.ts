import { Ctx, NotFoundError } from "blitz"
import db from "db"

type GetCandidateInterviewerInput = {
  stageId: string
  candidateId: string
}

async function getCandidateInterviewer(
  { stageId, candidateId }: GetCandidateInterviewerInput,
  ctx: Ctx
) {
  const candidateInterviewer = await db.candidateStageInterviewer.findFirst({
    where: { stageId, candidateId },
    include: {
      interviewer: { include: { calendars: true, defaultCalendars: true, defaultSchedules: true } },
    },
  })

  const stageInterviewer = await db.stage.findFirst({
    where: { id: stageId },
    include: {
      interviewer: { include: { calendars: true, defaultCalendars: true, defaultSchedules: true } },
    },
  })

  const interviewer = candidateInterviewer?.interviewer || stageInterviewer?.interviewer

  if (!interviewer) throw new NotFoundError()

  return interviewer
}

export default getCandidateInterviewer
