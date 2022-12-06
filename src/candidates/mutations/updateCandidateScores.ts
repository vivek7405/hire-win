import { Ctx } from "blitz"
import db, { CandidateActivityType, Prisma, User } from "db"
import { Candidate } from "src/candidates/validations"
import Guard from "src/guard/ability"

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
          // form: {
          //   include: { questions: { include: { question: { include: { options: true } } } } },
          // },
          formQuestions: { include: { options: true }, orderBy: { order: "asc" } },
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
      answers: { include: { formQuestion: { include: { options: true } } } },
    },
  })

  if (scores && scores.length > 0) {
    let loggedInUser: User | null = null
    if (ctx?.session?.userId) {
      loggedInUser = await db.user.findFirst({ where: { id: ctx?.session?.userId } })
    }

    const stage = await db.stage.findFirst({
      where: { id: scores[0]?.stageId },
    })

    await db.candidateActivity.create({
      data: {
        title: `Candidate score ${
          scores?.map((score) => score.rating)?.reduce((a, b) => a + b, 0) / scores.length
        }/5 submitted for stage "${stage?.name}" by ${loggedInUser?.name}`,
        type: CandidateActivityType.Score_Submitted,
        performedByUserId: ctx?.session?.userId || "0",
        candidateId: candidate?.id || "0",
      },
    })
  }

  return candidate
}

export default updateCandidateScores
// export default Guard.authorize("update", "candidate", updateCandidateScores)
