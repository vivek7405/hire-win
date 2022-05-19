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
    where: { candidateId, AND: { interviewDetail: { workflowStageId } } },
    include: { organizer: true, interviewer: true, otherAttendees: true, interviewDetail: true },
    orderBy: { startDateUTC: "asc" },
  })

  return candidateStageInterviews
}