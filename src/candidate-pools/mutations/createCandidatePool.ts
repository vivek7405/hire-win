import { Ctx } from "blitz";
import db from "db"
import { CandidatePoolObj, CandidatePoolInputType } from "src/candidate-pools/validations"
import Guard from "src/guard/ability"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"

async function createCandidatePool(data: CandidatePoolInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { name } = CandidatePoolObj.parse(data)

  const slug = slugify(name, { strict: true, lower: true })
  // const newSlug = await findFreeSlug(
  //   slug,
  //   async (e) => await db.candidatePool.findFirst({ where: { slug: e } })
  // )

  const candidatePool = await db.candidatePool.create({
    data: {
      name: name,
      slug,
      company: {
        connect: {
          id: ctx.session.companyId || "0",
        },
      },
      createdBy: {
        connect: {
          id: ctx.session.userId || "0",
        },
      },
    },
  })

  return candidatePool
}

export default createCandidatePool
