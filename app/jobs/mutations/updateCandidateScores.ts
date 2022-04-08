import { Ctx } from "blitz"
import db, { Prisma } from "db"
import { Candidate } from "app/jobs/validations"
import Guard from "app/guard/ability"
import { ExtendedCandidate } from "types"

type UpdateCandidateScoresInput = Pick<Prisma.CandidateUpdateArgs, "where" | "data"> & {
  initial: ExtendedCandidate
}

async function updateCandidateScores(
  { where, data, initial }: UpdateCandidateScoresInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const { id, scores } = Candidate.parse(data)

  const scoresToDelete = await db.score.findMany({
    where: {
      candidateId: id,
      workflowStageId: scores && scores.length > 0 ? scores[0]?.workflowStageId : "0",
    },
  })

  let updateData = {
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
  }

  const candidate = await db.candidate.update({
    where,
    data: updateData,
  })

  return candidate
}

export default Guard.authorize("update", "candidate", updateCandidateScores)
