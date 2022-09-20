import { Ctx } from "blitz"
import db, { Prisma } from "db"
import { Candidate } from "app/candidates/validations"
import Guard from "app/guard/ability"
import { ExtendedCandidate } from "types"

type UpdateCandidateStageInput = Pick<Prisma.CandidateUpdateArgs, "where"> & {
  data: { stageId: string }
}

async function updateCandidateStage({ where, data }: UpdateCandidateStageInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { stageId } = data

  const candidate = await db.candidate.update({
    where,
    data: {
      stageId,
    },
    include: {
      job: {
        include: {
          form: {
            include: { questions: { include: { question: { include: { options: true } } } } },
          },
          stages: { include: { interviewer: true, scoreCardQuestions: true, scores: true } },
        },
      },
      stage: { include: { interviewer: true, scoreCardQuestions: true, scores: true } },
      answers: { include: { question: { include: { options: true } } } },
      scores: true,
    },
  })

  return candidate
}

export default Guard.authorize("update", "candidate", updateCandidateStage)
