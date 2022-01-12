import { Ctx } from "blitz"
import db, { Prisma } from "db"
import { Candidate } from "app/jobs/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedCandidate } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type UpdateCandidateInput = Pick<Prisma.CandidateUpdateArgs, "where" | "data">

async function updateCandidate({ where, data }: UpdateCandidateInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { id, answers, jobId } = Candidate.parse(data)

  const candidate = await db.candidate.update({
    where,
    data: {
      jobId: jobId!,
      answers: {
        update: answers?.map((answer) => {
          return {
            where: {
              candidateId_questionId: {
                candidateId: id!,
                questionId: answer.questionId!,
              },
            },
            data: {
              value: answer.value,
              questionId: answer.questionId!,
            },
          }
        }),
      },
    },
  })

  return candidate
}

export default Guard.authorize("update", "candidate", updateCandidate)
