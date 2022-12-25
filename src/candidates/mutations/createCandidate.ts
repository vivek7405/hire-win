import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db, { CandidateActivityType, CandidateSource, FormQuestionType, User } from "db"
import { Candidate, CandidateInputType } from "src/candidates/validations"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import Guard from "src/guard/ability"
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

  let createCandidateData = {
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

  const existingCandidate = await db.candidate.findUnique({
    where: { jobId_email: { jobId: jobId || "0", email } },
    include: { answers: { include: { formQuestion: true } } },
  })

  let loggedInUser: User | null = null
  if (ctx?.session?.userId) {
    loggedInUser = await db.user.findFirst({ where: { id: ctx?.session?.userId } })
  }

  if (existingCandidate && loggedInUser) {
    throw new Error("This candidate already exists.")
  }

  // Allow candidate info to be updated only from careers page
  // The old info shall retain even though the candidate provided
  // a blank value while re-applying
  // E.g. candidate provided phone number in the first application
  // but while re-applying they provided a blank value for phone number
  // The old phone number shall still be retained
  let updateCandidateData = {
    name,
    answers: {
      upsert: answers?.map((answer) => {
        return {
          where: {
            candidateId_formQuestionId: {
              candidateId: existingCandidate?.id || "0",
              formQuestionId: answer.formQuestionId!,
            },
          },
          update: {
            value:
              // For handling the old value retention logic for attachment types,
              // we need to check if the key is blank
              // If the key is blank, provide a blank value for answer so that the next OR condition is executed
              // The next condition OR condition will retain the old attachment data
              (existingCandidate?.answers?.find(
                (ans) => ans.formQuestionId === answer.formQuestionId
              )?.formQuestion?.type !== FormQuestionType.Attachment
                ? answer.value
                : JSON.parse(answer?.value)?.key
                ? answer.value
                : "") ||
              existingCandidate?.answers?.find(
                (ans) => ans.formQuestionId === answer.formQuestionId
              )?.value ||
              "",
            formQuestionId: answer.formQuestionId!,
          },
          create: {
            value: answer.value,
            formQuestionId: answer.formQuestionId!,
          },
        }
      }),
    },
  }

  if (resume) {
    createCandidateData["resume"] = resume

    if (existingCandidate && resume?.key) {
      updateCandidateData["resume"] = resume
    }
  }

  // const candidate = await db.candidate.create({
  //   data: candidateData,
  // })

  const candidate = await db.candidate.upsert({
    where: {
      jobId_email: { jobId: jobId || "0", email },
    },
    update: {
      ...updateCandidateData,
    },
    create: {
      ...createCandidateData,
    },
  })

  const assignedCandidateInterviewer = await getCandidateInterviewer(
    {
      stageId: candidate?.stageId || "0",
      candidateId: candidate?.id || "0",
    },
    ctx
  )

  if (existingCandidate) {
    await db.candidateActivity.create({
      data: {
        title: `Candidate info updated ${
          loggedInUser ? `by ${loggedInUser?.name}` : "through careers page"
        }`,
        type: CandidateActivityType.Candidate_Updated,
        performedByUserId: ctx?.session?.userId || null,
        candidateId: existingCandidate?.id || "0",
      },
    })
  } else {
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
  }

  return candidate
}

export default Guard.authorize(
  "create",
  "candidate",
  resolver.pipe(resolver.zod(Candidate), createCandidate)
)
