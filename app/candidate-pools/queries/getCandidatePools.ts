import Guard from "app/guard/ability"
import { resolver } from "blitz"
import db, { Prisma } from "db"

interface GetCandidatePoolsInput extends Pick<Prisma.CandidatePoolFindManyArgs, "where"> {}

const getCandidatePoolsWOPagination = resolver.pipe(
  resolver.authorize(),
  async ({ where }: GetCandidatePoolsInput) => {
    const categories = await db.candidatePool.findMany({
      where,
      include: { _count: { select: { candidates: true } } },
    })
    return categories
  }
)

export default Guard.authorize("readAll", "candidatePool", getCandidatePoolsWOPagination)
