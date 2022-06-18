import db from "db"

type GetCandidateInterviewsByStageInput = {
  candidateId: string
  workflowStageId: string
}
export default async function getCandidateInterviewsByStage({
  candidateId,
  workflowStageId,
}: GetCandidateInterviewsByStageInput) {
  const candidateStageInterviews = await db.interview.findMany({
    where: { candidateId, workflowStageId },
    include: { organizer: true, interviewer: true, otherAttendees: true },
    orderBy: { startDateUTC: "asc" },
  })

  return candidateStageInterviews
}
