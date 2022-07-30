import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetCandidatepoolsInput
  extends Pick<Prisma.CandidatePoolFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getCandidatepools(
  { where, orderBy, skip = 0, take = 100 }: GetCandidatepoolsInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: candidatepools,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.candidatePool.count({ where }),
    query: (paginateArgs) =>
      db.candidatePool.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    candidatepools,
    hasMore,
    count,
  }
}

export default getCandidatepools
