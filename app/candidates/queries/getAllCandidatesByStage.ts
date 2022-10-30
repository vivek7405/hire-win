import { Ctx } from "blitz"
import db, { Prisma } from "db"

type GetAllCandidatesInputType = {
  stageId: string
  rejected: boolean
}
async function getAllCandidatesByStage({ stageId, rejected }: GetAllCandidatesInputType, ctx: Ctx) {
  const stageCandidates = db.candidate.findMany({
    where: { stageId, rejected },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, rejected: true, job: { select: { slug: true } } },
  })

  return stageCandidates
}

export default getAllCandidatesByStage
