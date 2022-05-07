import db from "db"
const bcrypt = require("bcrypt")

export default async function verifyCancelCode({ interviewId, cancelCode }) {
  const interview = await db.interview.findFirst({
    where: { id: interviewId },
  })

  if (!interview) {
    return false
  }

  const isCodeValid = await bcrypt.compare(cancelCode, interview.cancelCode)

  return isCodeValid
}
