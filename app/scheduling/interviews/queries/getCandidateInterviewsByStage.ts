import db from "db"

type GetCandidateInterviewsByStageInput = {
  candidateId: string
  stageId: string
}
export default async function getCandidateInterviewsByStage({
  candidateId,
  stageId,
}: GetCandidateInterviewsByStageInput) {
  const candidateStageInterviews = await db.interview.findMany({
    where: { candidateId, stageId },
    include: { organizer: true, interviewer: true, otherAttendees: true },
    orderBy: { startDateUTC: "asc" },
  })

  return candidateStageInterviews
}
