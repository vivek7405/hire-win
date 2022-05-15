import db from "db"

type GetCandidateEmailsByStageInput = {
  candidateId: string
  workflowStageId: string
}
export default async function getCandidateEmailsByStage({
  candidateId,
  workflowStageId,
}: GetCandidateEmailsByStageInput) {
  const candidateStageEmails = await db.email.findMany({
    where: { candidateId, workflowStageId },
    include: { sender: true, candidate: true, templateUsed: true },
    orderBy: { createdAt: "asc" },
  })

  return candidateStageEmails
}
