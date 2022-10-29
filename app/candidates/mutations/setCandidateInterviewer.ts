import { AuthenticationError, Ctx } from "blitz"
import db, { CandidateActivityType, Prisma, User } from "db"
import { Candidate } from "app/candidates/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedCandidate } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type UpdateCandidateWorkflowStageInterviewerInput = {
  candidateId: string
  stageId: string
  interviewerId: string
}

async function setCandidateInterviewer(
  { candidateId, stageId, interviewerId }: UpdateCandidateWorkflowStageInterviewerInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const interviewer = await db.user.findUnique({
    where: { id: interviewerId },
  })

  const stage = await db.stage.findUnique({
    where: { id: stageId },
    select: { name: true, interviewer: true },
  })

  const candidate = await db.candidate.findUnique({
    where: { id: candidateId },
  })

  if (interviewer && stage && candidate) {
    const previousCandidateStageInterviewer = await db.candidateStageInterviewer.findFirst({
      where: { candidateId, stageId },
      select: { interviewer: true },
    })

    const candidateStageInterviewer = await db.candidateStageInterviewer.upsert({
      where: { candidateId_stageId: { candidateId, stageId } },
      update: {
        interviewerId: interviewerId,
      },
      create: {
        candidateId,
        stageId,
        interviewerId,
      },
      include: { interviewer: true },
    })

    let loggedInUser: User | null = null
    if (ctx?.session?.userId) {
      loggedInUser = await db.user.findFirst({ where: { id: ctx?.session?.userId } })
    }

    await db.candidateActivity.create({
      data: {
        title: `Candidate interviewer changed from ${
          previousCandidateStageInterviewer
            ? previousCandidateStageInterviewer?.interviewer?.name
            : stage?.interviewer?.name
        } to ${candidateStageInterviewer?.interviewer?.name} in stage "${stage?.name}" by ${
          loggedInUser?.name
        }`,
        type: CandidateActivityType.Interviewer_Changed,
        performedByUserId: ctx?.session?.userId || "0",
        candidateId,
      },
    })

    return candidateStageInterviewer
  } else {
    throw new Error("Invalid interviewer id, stage id or candidate id")
  }
}

export default setCandidateInterviewer
