import { Ctx, AuthenticationError } from "blitz"
import db from "db"
import { CandidatePoolObj, CandidatePoolInputType } from "app/candidate-pools/validations"
import Guard from "app/guard/ability"
import slugify from "slugify"
import { findFreeSlug } from "app/core/utils/findFreeSlug"

async function createCandidatePool(data: CandidatePoolInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { name } = CandidatePoolObj.parse(data)

  const slug = slugify(name, { strict: true })
  const newSlug = await findFreeSlug(
    slug,
    async (e) => await db.candidatePool.findFirst({ where: { slug: e } })
  )

  const candidatePool = await db.candidatePool.create({
    data: {
      name: name,
      slug: newSlug,
      user: {
        connect: {
          id: ctx.session.userId || 0,
        },
      },
    },
  })

  return candidatePool
}

export default createCandidatePool
