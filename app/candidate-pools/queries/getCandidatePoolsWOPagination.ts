import Guard from "app/guard/ability"
import { resolver } from "blitz"
import db, { Prisma } from "db"

interface GetCandidatePoolsWOPaginationInput
  extends Pick<Prisma.CandidatePoolFindManyArgs, "where"> {}

const getCandidatePoolsWOPagination = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetCandidatePoolsWOPaginationInput) => {
    const candidatePools = await db.candidatePool.findMany({
      where,
      include: { candidates: { select: { id: true } }, _count: { select: { candidates: true } } },
    })
    return candidatePools
  }
)

export default Guard.authorize("readAll", "candidatePool", getCandidatePoolsWOPagination)
