import { Ctx } from "blitz"
import db, { CandidateActivityType, Prisma, User } from "db"
import axios from "axios"
import { AttachmentObject } from "types"
import { getAntiCSRFToken } from "@blitzjs/auth"

type DeleteCandidateFileInput = {
  candidateFileId: string
}

async function deleteCandidateFile({ candidateFileId }: DeleteCandidateFileInput, ctx: Ctx) {
  ctx.session.$authorize()

  const candidateFile = await db.candidateFile.findUnique({
    where: {
      id: candidateFileId,
    },
  })

  if (!candidateFile) throw new Error("Incorrect Candidate File Id")

  const candidate = await db.candidate.findUnique({
    where: { id: candidateFile.candidateId },
    include: { stage: true },
  })

  try {
    const antiCSRFToken = getAntiCSRFToken()
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/files/removeFile`
    const config = {
      headers: {
        "content-type": "application/json",
        "anti-csrf": antiCSRFToken,
      },
    }
    await axios.post(url, candidateFile.attachment || {}, config)
  } catch (error) {}

  const deletedCandidateFile = await db.candidateFile.delete({
    where: {
      id: candidateFileId,
    },
  })

  let loggedInUser: User | null = null
  if (ctx?.session?.userId) {
    loggedInUser = await db.user.findFirst({ where: { id: ctx?.session?.userId } })
  }

  await db.candidateActivity.create({
    data: {
      title: `Candidate file "${
        (candidateFile?.attachment as AttachmentObject)?.name
      }" deleted by ${loggedInUser?.name} while in stage "${candidate?.stage?.name}"`,
      type: CandidateActivityType.File_Deleted,
      performedByUserId: ctx?.session?.userId || "0",
      candidateId: candidate?.id || "0",
    },
  })

  return deletedCandidateFile
}

export default deleteCandidateFile
