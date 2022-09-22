import db from "db"

type GetCandidateEmailsByStageInput = {
  candidateId: string
  stageId: string
}
export default async function getCandidateEmailsByStage({
  candidateId,
  stageId,
}: GetCandidateEmailsByStageInput) {
  const candidateStageEmails = await db.email.findMany({
    where: { candidateId, stageId },
    include: { sender: true, candidate: true, templateUsed: true },
    orderBy: { createdAt: "asc" },
  })

  return candidateStageEmails
}
