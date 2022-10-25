import { Ctx, resolver } from "blitz"
import db from "db"
import {
  Candidate,
  CandidateFileInputType,
  CandidateFileObj,
  CandidateInputType,
} from "app/candidates/validations"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"
import Guard from "app/guard/ability"

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

  return candidateFile
}

export default createCandidateFile
