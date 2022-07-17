import { Ctx, resolver } from "blitz"
import db from "db"
import { Candidate, CandidateInputType } from "app/candidates/validations"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import Guard from "app/guard/ability"

// Candidate can be created without authentication
async function createCandidate(data: CandidateInputType, ctx: Ctx) {
  const { name, email, resume, answers, jobId, source } = Candidate.parse(data)

  // const slug = slugify(name, { strict: true, lower: true })
  // const newSlug = await findFreeSlug(
  //   slug,
  //   async (e) => await db.candidate.findFirst({ where: { slug: e, jobId } })
  // )

  const jobUser = await db.jobUser.findFirst({
    where: { jobId },
    include: {
      job: { include: { workflow: { include: { stages: { include: { stage: true } } } } } },
    },
  })
  const defaultWorkflowStage = jobUser?.job?.workflow?.stages?.find(
    (ws) => ws.stage.name === "Sourced"
  )

  let candidateData = {
    name,
    email,
    // slug: newSlug,
    answers: {
      create: answers?.map((answer) => {
        return {
          value: answer.value,
          questionId: answer.questionId!,
        }
      }),
    },
    jobId: jobId!,
    source,
    workflowStageId: defaultWorkflowStage?.id,
  }

  if (resume) {
    candidateData["resume"] = resume
  }

  const candidate = await db.candidate.create({
    data: candidateData,
  })

  return candidate
}

export default Guard.authorize(
  "create",
  "candidate",
  resolver.pipe(resolver.zod(Candidate), createCandidate)
)
