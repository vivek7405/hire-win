import { Ctx, resolver } from "blitz"
import db, { CandidateActivityType, CandidateSource, User } from "db"
import { Candidate, CandidateInputType } from "app/candidates/validations"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import Guard from "app/guard/ability"
import getCandidateInterviewer from "../queries/getCandidateInterviewer"

// Candidate can be created without authentication
async function createCandidate(data: CandidateInputType, ctx: Ctx) {
  const { name, email, resume, answers, jobId, source, createdById } = Candidate.parse(data)

  // const slug = slugify(name, { strict: true, lower: true })
  // const newSlug = await findFreeSlug(
  //   slug,
  //   async (e) => await db.candidate.findFirst({ where: { slug: e, jobId } })
  // )

  const jobUser = await db.jobUser.findFirst({
    where: { jobId },
    include: {
      job: {
        include: {
          // workflow: { include: { stages: { include: { stage: true } } } },
          stages: true,
        },
      },
    },
  })
  const defaultStage = jobUser?.job?.stages?.find(
    (stage) => stage.jobId === jobId && stage.name === "Sourced"
  )

  let candidateData = {
    name,
    email,
    // slug: newSlug,
    answers: {
      create: answers?.map((answer) => {
        return {
          value: answer.value,
          formQuestionId: answer.formQuestionId!,
        }
      }),
    },
    jobId: jobId!,
    source,
    stageId: defaultStage?.id,
    createdById,
  }

  if (resume) {
    candidateData["resume"] = resume
  }

  const candidate = await db.candidate.create({
    data: candidateData,
  })

  let loggedInUser: User | null = null
  if (ctx?.session?.userId) {
    loggedInUser = await db.user.findFirst({ where: { id: ctx?.session?.userId } })
  }

  const assignedCandidateInterviewer = await getCandidateInterviewer(
    {
      stageId: candidate?.stageId || "0",
      candidateId: candidate?.id || "0",
    },
    ctx
  )

  await db.candidateActivity.create({
    data: {
      title: `Candidate ${
        source === CandidateSource.Manual
          ? `added manually by ${loggedInUser?.name}`
          : "applied through careers page"
      }. Interviewer ${assignedCandidateInterviewer?.name} assigned.`,
      type: CandidateActivityType.Candidate_Added,
      candidateId: candidate?.id || "0",
      performedByUserId: ctx?.session?.userId || null,
    },
  })

  return candidate
}

export default Guard.authorize(
  "create",
  "candidate",
  resolver.pipe(resolver.zod(Candidate), createCandidate)
)
