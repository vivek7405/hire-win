import { resolver } from "@blitzjs/rpc"
import Guard from "src/guard/ability"
import { paginate } from "blitz"
import db, { Prisma } from "db"

interface GetCandidatePoolsInput
  extends Pick<Prisma.CandidatePoolFindManyArgs, "where" | "skip" | "take"> {}

const getCandidatePools = resolver.pipe(
  resolver.authorize(),
  async ({ where, skip = 0, take = 100 }: GetCandidatePoolsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: candidatePools,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.candidatePool.count({ where }),
      query: (paginateArgs) =>
        db.candidatePool.findMany({
          ...paginateArgs,
          where,
          include: { _count: { select: { candidates: true } } },
          orderBy: { createdAt: "asc" },
        }),
    })

    return {
      candidatePools,
      nextPage,
      hasMore,
      count,
    }
  }
)

export default Guard.authorize("readAll", "candidatePool", getCandidatePools)
