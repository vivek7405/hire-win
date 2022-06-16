import Guard from "app/guard/ability"
import { Ctx, NotFoundError } from "blitz"
import db, { Prisma } from "db"

interface GetCandidateWorkflowStageInterviewerInput
  extends Pick<Prisma.CandidateWorkflowStageInterviewerFindFirstArgs, "where"> {}

async function getCandidateWorkflowStageInterviewer(
  { where }: GetCandidateWorkflowStageInterviewerInput,
  ctx: Ctx
) {
  const candidateWorkflowStageInterviewer = await db.candidateWorkflowStageInterviewer.findFirst({
    where,
    include: {
      candidate: true,
      workflowStage: { include: { stage: true } },
      interviewer: true,
    },
  })

  return candidateWorkflowStageInterviewer
}

export default getCandidateWorkflowStageInterviewer
