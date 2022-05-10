import db from "db"
import bcrypt from "bcrypt"

type VerifyCancelCodeInput = {
  interviewId: number
  cancelCode: string
}
export default async function verifyCancelCode({ interviewId, cancelCode }: VerifyCancelCodeInput) {
  const interview = await db.interview.findFirst({
    where: { id: interviewId },
  })

  if (!interview) {
    return false
  }

  const isCodeValid = await bcrypt.compare(cancelCode, interview.cancelCode)

  return isCodeValid
}
