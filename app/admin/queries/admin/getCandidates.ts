import { paginate, Ctx } from "blitz"
import db, { Prisma } from "db"

interface GetCandidatesInput
  extends Pick<Prisma.CandidateFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

async function getCandidates(
  { where, orderBy, skip = 0, take = 100 }: GetCandidatesInput,
  ctx: Ctx
) {
  ctx.session.$authorize("ADMIN")

  const {
    items: candidates,
    hasMore,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.candidate.count({ where }),
    query: (paginateArgs) =>
      db.candidate.findMany({
        ...paginateArgs,
        where,
        orderBy,
      }),
  })

  return {
    candidates,
    hasMore,
    count,
  }
}

export default getCandidates
