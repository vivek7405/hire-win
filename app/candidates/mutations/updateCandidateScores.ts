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
      stageId: scores && scores.length > 0 ? scores[0]?.stageId : "0",
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
            stageId: score.stageId,
          },
          update: {
            rating: score.rating,
            note: score.note,
            scoreCardQuestionId: score.scoreCardQuestionId!,
            stageId: score.stageId,
          },
          where: {
            id: "0",
          },
        }
      }),
    },
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
          stages: {
            include: { interviewer: true, scoreCardQuestions: true, scores: true },
            orderBy: { order: "asc" },
          },
          // workflow: { include: { stages: { include: { stage: true, interviewDetails: true } } } },
          // scoreCards: {
          //   include: {
          //     scoreCard: {
          //       include: {
          //         cardQuestions: { include: { cardQuestion: true, scores: true } },
          //         jobWorkflowStages: {
          //           include: {
          //             scoreCard: {
          //               include: { cardQuestions: { include: { cardQuestion: true } } },
          //             },
          //           },
          //         },
          //       },
          //     },
          //   },
          // },
        },
      },
      scores: true,
      stage: { include: { interviewer: true } },
      // workflowStage: { include: { stage: true, interviewDetails: true } },
      answers: { include: { question: { include: { options: true } } } },
    },
  })

  return candidate
}

export default updateCandidateScores
// export default Guard.authorize("update", "candidate", updateCandidateScores)
