import { Ctx } from "blitz"
import db, { Candidate, CandidatePool, Prisma } from "db"
import { CandidatePoolObj } from "src/candidate-pools/validations"
import Guard from "src/guard/ability"
// import { ExtendedCandidatePool } from "types"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"

type UpdateCandidatePoolInput = Pick<Prisma.CandidatePoolUpdateArgs, "where" | "data"> & {
  initial: CandidatePool
}

async function updateCandidatePool({ where, data, initial }: UpdateCandidatePoolInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { name } = CandidatePoolObj.parse(data)

  const slug = slugify(name, { strict: true, lower: true })
  // const newSlug = await findFreeSlug(
  //   slug,
  //   async (e) => await db.candidatePool.findFirst({ where: { slug: e } })
  // )

  const candidatePool = await db.candidatePool.update({
    where,
    data: {
      name,
      slug,
    },
  })

  return candidatePool
}

export default updateCandidatePool
// export default Guard.authorize("read", "candidatePool", updateCandidatePool)
