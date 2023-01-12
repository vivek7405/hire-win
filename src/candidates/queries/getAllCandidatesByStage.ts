import { Ctx } from "blitz"
import db, { Prisma } from "db"

type GetAllCandidatesInputType = {
  stageId: string
  rejected: boolean
}
async function getAllCandidatesByStage({ stageId, rejected }: GetAllCandidatesInputType, ctx: Ctx) {
  const stage = await db.stage.findUnique({
    where: { id: stageId || "0" },
    include: { job: { include: { company: true } } },
  })

  const parentCompanyUser = await db.parentCompanyUser.findFirst({
    where: {
      parentCompanyId: stage?.job?.company?.parentCompanyId,
      userId: ctx?.session?.userId || "0",
    },
    include: { parentCompany: true },
  })

  const stageCandidates = db.candidate.findMany({
    where: {
      stageId,
      rejected,
      visibleOnlyToParentMembers:
        !!parentCompanyUser?.parentCompany?.name && parentCompanyUser ? {} : false,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      rejected: true,
      stage: { select: { name: true } },
      scores: { select: { rating: true } },
      job: { select: { slug: true } },
      visibleOnlyToParentMembers: true,
    },
  })

  return stageCandidates
}

export default getAllCandidatesByStage
