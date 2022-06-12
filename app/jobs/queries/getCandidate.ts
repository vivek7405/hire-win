import Guard from "app/guard/ability"
import { Ctx, NotFoundError } from "blitz"
import db, { Prisma } from "db"

interface GetCandidateInput extends Pick<Prisma.CandidateFindFirstArgs, "where"> {}

async function getCandidate({ where }: GetCandidateInput, ctx: Ctx) {
  const candidate = await db.candidate.findFirst({
    where,
    include: {
      job: {
        include: {
          form: {
            include: {
              questions: {
                include: { question: { include: { options: true } } },
                orderBy: { order: "asc" },
              },
            },
          },
          workflow: {
            include: {
              stages: {
                include: { stage: true, interviewDetails: true },
                orderBy: { order: "asc" },
              },
            },
          },
          scoreCards: {
            include: {
              scoreCard: {
                include: {
                  cardQuestions: {
                    include: { cardQuestion: true, scores: true },
                    orderBy: { order: "asc" },
                  },
                  jobWorkflowStages: {
                    include: {
                      scoreCard: {
                        include: {
                          cardQuestions: {
                            include: { cardQuestion: true },
                            orderBy: { order: "asc" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      scores: true,
      workflowStage: { include: { stage: true, interviewDetails: true } },
      answers: { include: { question: { include: { options: true } } } },
    },
  })

  if (!candidate) throw new NotFoundError()

  return candidate
}

export default Guard.authorize("read", "candidate", getCandidate)
