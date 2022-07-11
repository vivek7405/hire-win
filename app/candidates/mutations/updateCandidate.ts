import { Ctx } from "blitz"
import db, { Prisma } from "db"
import { Candidate } from "app/candidates/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedCandidate } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type UpdateCandidateInput = Pick<Prisma.CandidateUpdateArgs, "where" | "data"> & {
  initial: ExtendedCandidate
}

async function updateCandidate({ where, data, initial }: UpdateCandidateInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { id, name, email, resume, answers, jobId } = Candidate.parse(data)

  const slug = slugify(name, { strict: true, lower: true })
  const newSlug: string = await findFreeSlug(
    slug,
    async (e) => await db.candidate.findFirst({ where: { slug: e } })
  )

  let updateData = {
    name,
    email,
    slug: initial.name !== data.name ? newSlug : initial.slug,
    jobId: jobId!,
    answers: {
      upsert: answers?.map((answer) => {
        return {
          where: {
            candidateId_questionId: {
              candidateId: id!,
              questionId: answer.questionId!,
            },
          },
          create: {
            value: answer.value,
            questionId: answer.questionId!,
          },
          update: {
            value: answer.value,
            questionId: answer.questionId!,
          },
        }
      }),
    },
  }

  if (resume) {
    updateData["resume"] = resume
  }

  const candidate = await db.candidate.update({
    where,
    data: updateData,
  })

  return candidate
}

export default Guard.authorize("update", "candidate", updateCandidate)
