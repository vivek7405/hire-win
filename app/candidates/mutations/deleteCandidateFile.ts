import { Ctx } from "blitz"
import db, { Prisma } from "db"
import axios from "axios"

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

  try {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/files/removeFile`
    const config = {
      headers: {
        "content-type": "application/json",
      },
    }
    await axios.post(url, candidateFile.attachment || {}, config)
  } catch (error) {}

  const deletedCandidateFile = await db.candidateFile.delete({
    where: {
      id: candidateFileId,
    },
  })

  return deletedCandidateFile
}

export default deleteCandidateFile
