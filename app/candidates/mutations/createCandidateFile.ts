import { Ctx, resolver } from "blitz"
import db, { CandidateActivityType, User } from "db"
import {
  Candidate,
  CandidateFileInputType,
  CandidateFileObj,
  CandidateInputType,
} from "app/candidates/validations"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import Guard from "app/guard/ability"
import { AttachmentObject } from "types"

async function createCandidateFile(data: CandidateFileInputType, ctx: Ctx) {
  const { attachment, candidateId } = CandidateFileObj.parse(data)

  if (!attachment) throw new Error("No attachment provided")
  if (!candidateId) throw new Error("No candidate id provided")

  const candidateFile = await db.candidateFile.create({
    data: {
      createdById: ctx.session.userId,
      attachment,
      candidateId,
    },
  })

  const candidate = await db.candidate.findUnique({
    where: { id: candidateId },
    include: { stage: true },
  })

  let loggedInUser: User | null = null
  if (ctx?.session?.userId) {
    loggedInUser = await db.user.findFirst({ where: { id: ctx?.session?.userId } })
  }

  await db.candidateActivity.create({
    data: {
      title: `Candidate file "${(candidateFile?.attachment as AttachmentObject)?.name}" added by ${
        loggedInUser?.name
      } while in stage "${candidate?.stage?.name}"`,
      type: CandidateActivityType.File_Added,
      performedByUserId: ctx?.session?.userId || "0",
      candidateId: candidate?.id || "0",
    },
  })

  return candidateFile
}

export default createCandidateFile
