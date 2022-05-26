import Guard from "app/guard/ability"
import { resolver, NotFoundError, Ctx } from "blitz"
import { closestIndexTo } from "date-fns"
import db, { Prisma } from "db"

interface GetCandidatePoolInput extends Pick<Prisma.CandidatePoolFindFirstArgs, "where"> {}

const getCandidatePool = async ({ where }: GetCandidatePoolInput, ctx: Ctx) => {
  ctx.session.$authorize()

  const candidatePool = await db.candidatePool.findFirst({
    where,
    include: { candidates: { include: { job: { select: { slug: true } } } } },
  })

  if (!candidatePool) throw new NotFoundError()

  return candidatePool
}

export default Guard.authorize("read", "candidatePool", getCandidatePool)
// export default getCandidatePool
