import { Ctx } from "blitz"
import db from "db"
import { CandidateUserNoteInputType, CandidateUserNoteObj } from "app/candidates/validations"

async function saveCandidateUserNote(data: CandidateUserNoteInputType, ctx: Ctx) {
  const { candidateId, userId, note } = CandidateUserNoteObj.parse(data)

  if (!candidateId) throw new Error("No candidate id provided")
  if (!userId) throw new Error("No user id provided")

  const candidateUserNote = await db.candidateUserNote.upsert({
    where: { candidateId_userId: { candidateId, userId } },
    update: {
      note,
    },
    create: {
      candidateId,
      userId,
      note,
    },
  })

  return candidateUserNote
}

export default saveCandidateUserNote
