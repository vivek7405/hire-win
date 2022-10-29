import { Ctx } from "blitz"
import db, { CandidateActivityType, Prisma, User } from "db"
import { Candidate } from "app/candidates/validations"
import slugify from "slugify"
import Guard from "app/guard/ability"
import { ExtendedCandidate } from "types"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

type UpdateCandidateInput = Pick<Prisma.CandidateUpdateArgs, "where" | "data">

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "2mb",
    },
  },
}

async function updateCandidate({ where, data }: UpdateCandidateInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { id, name, email, resume, answers, jobId } = Candidate.parse(data)

  // const slug = slugify(name, { strict: true, lower: true })
  // const newSlug = await findFreeSlug(
  //   slug,
  //   async (e) => await db.candidate.findFirst({ where: { slug: e } })
  // )

  let updateData = {
    name,
    email,
    // slug: initial.name !== data.name ? newSlug : initial.slug,
    jobId: jobId!,
    answers: {
      upsert: answers?.map((answer) => {
        return {
          where: {
            candidateId_formQuestionId: {
              candidateId: id!,
              formQuestionId: answer.formQuestionId!,
            },
          },
          create: {
            value: answer.value,
            formQuestionId: answer.formQuestionId!,
          },
          update: {
            value: answer.value,
            formQuestionId: answer.formQuestionId!,
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

  let loggedInUser: User | null = null
  if (ctx?.session?.userId) {
    loggedInUser = await db.user.findFirst({ where: { id: ctx?.session?.userId } })
  }

  await db.candidateActivity.create({
    data: {
      title: `Candidate info updated by ${loggedInUser?.name}`,
      type: CandidateActivityType.Candidate_Updated,
      performedByUserId: ctx?.session?.userId || "0",
      candidateId: candidate?.id || "0",
    },
  })

  return candidate
}

export default Guard.authorize("update", "candidate", updateCandidate)
