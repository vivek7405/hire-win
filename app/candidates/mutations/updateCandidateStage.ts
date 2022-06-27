import { Ctx } from "blitz"
import db, { Prisma } from "db"
import { Candidate } from "app/candidates/validations"
import Guard from "app/guard/ability"
import { ExtendedCandidate } from "types"

type UpdateCandidateStageInput = Pick<Prisma.CandidateUpdateArgs, "where"> & {
  data: { workflowStageId: string }
}

async function updateCandidateStage({ where, data }: UpdateCandidateStageInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { workflowStageId } = data

  const candidate = await db.candidate.update({
    where,
    data: {
      workflowStageId,
    },
    include: {
      job: {
        include: {
          form: {
            include: { questions: { include: { question: { include: { options: true } } } } },
          },
          workflow: { include: { stages: { include: { stage: true, interviewDetails: true } } } },
          scoreCards: {
            include: {
              scoreCard: {
                include: {
                  cardQuestions: { include: { cardQuestion: true, scores: true } },
                  jobWorkflowStages: {
                    include: {
                      scoreCard: {
                        include: { cardQuestions: { include: { cardQuestion: true } } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      workflowStage: { include: { stage: true, interviewDetails: true } },
      answers: { include: { question: { include: { options: true } } } },
    },
  })

  return candidate
}

export default Guard.authorize("update", "candidate", updateCandidateStage)
