import { resolver } from "@blitzjs/rpc"
import Guard from "src/guard/ability"
import db, { Prisma } from "db"

interface GetCandidatePoolsWOPaginationInput
  extends Pick<Prisma.CandidatePoolFindManyArgs, "where"> {}

const getCandidatePoolsWOPagination = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetCandidatePoolsWOPaginationInput) => {
    const candidatePools = await db.candidatePool.findMany({
      where,
      include: { candidates: { select: { id: true } }, _count: { select: { candidates: true } } },
      orderBy: { createdAt: "asc" },
    })
    return candidatePools
  }
)

export default getCandidatePoolsWOPagination
// export default Guard.authorize("readAll", "candidatePool", getCandidatePoolsWOPagination)
