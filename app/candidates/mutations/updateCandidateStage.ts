import { Ctx } from "blitz"
import db, { CandidateActivityType, Prisma, User } from "db"
import { Candidate } from "app/candidates/validations"
import Guard from "app/guard/ability"
import { ExtendedCandidate } from "types"
import getCandidateInterviewer from "../queries/getCandidateInterviewer"

type UpdateCandidateStageInput = Pick<Prisma.CandidateUpdateArgs, "where"> & {
  data: { stageId: string }
}

async function updateCandidateStage({ where, data }: UpdateCandidateStageInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { stageId } = data

  const previousStage = await db.candidate.findUnique({
    where,
    select: { stage: true },
  })

  const candidate = await db.candidate.update({
    where,
    data: {
      stageId,
    },
    include: {
      job: {
        include: {
          formQuestions: { include: { options: true } },
          stages: { include: { interviewer: true, scoreCardQuestions: true, scores: true } },
        },
      },
      stage: { include: { interviewer: true, scoreCardQuestions: true, scores: true } },
      answers: { include: { formQuestion: { include: { options: true } } } },
      scores: true,
    },
  })

  let loggedInUser: User | null = null
  if (ctx?.session?.userId) {
    loggedInUser = await db.user.findFirst({ where: { id: ctx?.session?.userId } })
  }

  const assignedCandidateInterviewer = await getCandidateInterviewer(
    {
      stageId: candidate?.stageId || "0",
      candidateId: candidate?.id || "0",
    },
    ctx
  )

  await db.candidateActivity.create({
    data: {
      title: `Candidate moved from stage "${previousStage?.stage?.name}" to stage "${candidate?.stage?.name}" by ${loggedInUser?.name}. Interviewer ${assignedCandidateInterviewer?.name} assigned.`,
      type: CandidateActivityType.Stage_Changed,
      performedByUserId: ctx?.session?.userId || "0",
      candidateId: candidate?.id || "0",
    },
  })

  return candidate
}

export default updateCandidateStage
