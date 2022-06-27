import { Ctx } from "blitz"
import db, { Prisma } from "db"
import { Candidate } from "app/candidates/validations"
import Guard from "app/guard/ability"

type UpdateCandidateScoresInput = Pick<Prisma.CandidateUpdateArgs, "where" | "data">

async function updateCandidateScores({ where, data }: UpdateCandidateScoresInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { id, scores } = Candidate.parse(data)

  const scoresToDelete = await db.score.findMany({
    where: {
      candidateId: id,
      workflowStageId: scores && scores.length > 0 ? scores[0]?.workflowStageId : "0",
    },
  })

  let updateData = {
    scores: {
      delete: scoresToDelete?.map((op) => {
        return { id: op.id }
      }),
      upsert: scores?.map((score) => {
        return {
          create: {
            rating: score.rating,
            note: score.note,
            scoreCardQuestionId: score.scoreCardQuestionId!,
            workflowStageId: score.workflowStageId,
          },
          update: {
            rating: score.rating,
            note: score.note,
            scoreCardQuestionId: score.scoreCardQuestionId!,
            workflowStageId: score.workflowStageId,
          },
          where: {
            id: "0",
          },
        }
      }),
    },
    // scores: {
    //   create: scores
    //     ?.filter((score) => !alreadyExists.map((sc) => sc.id).includes(score.id || "0"))
    //     ?.map((score) => {
    //       return {
    //         rating: score.rating,
    //         note: score.note,
    //         scoreCardQuestionId: score.scoreCardQuestionId!,
    //         workflowStageId: score.workflowStageId,
    //       }
    //     }),
    //   update: scores
    //     ?.filter((score) => alreadyExists.map((sc) => sc.id).includes(score.id || "0"))
    //     ?.map((score) => {
    //       return {
    //         where: {
    //           candidateId_scoreCardQuestionId_workflowStageId: {
    //             candidateId: id!,
    //             scoreCardQuestionId: score.scoreCardQuestionId!,
    //             workflowStageId: score.workflowStageId,
    //           },
    //         },
    //         data: {
    //           rating: score.rating,
    //           note: score.note,
    //           scoreCardQuestionId: score.scoreCardQuestionId!,
    //           workflowStageId: score.workflowStageId,
    //         },
    //       }
    //     }),
    // },
  }

  const candidate = await db.candidate.update({
    where,
    data: updateData,
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
      scores: true,
      workflowStage: { include: { stage: true, interviewDetails: true } },
      answers: { include: { question: { include: { options: true } } } },
    },
  })

  return candidate
}

export default Guard.authorize("update", "candidate", updateCandidateScores)
