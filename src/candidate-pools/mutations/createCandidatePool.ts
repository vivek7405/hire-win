import { Ctx, NotFoundError } from "blitz"
import db from "db"
import { CandidatePoolObj, CandidatePoolInputType } from "src/candidate-pools/validations"
import Guard from "src/guard/ability"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"

async function createCandidatePool(data: CandidatePoolInputType, ctx: Ctx) {
  ctx.session.$authorize()

  const { name, parentCompanyId } = CandidatePoolObj.parse(data)

  if (parentCompanyId) {
    const parentCompany = await db.parentCompany.findUnique({
      where: { id: parentCompanyId || "0" },
    })
    if (!parentCompany) {
      throw new NotFoundError("Parent company with provided id not found")
    }
  }

  const slug = slugify(name, { strict: true, lower: true })
  // const newSlug = await findFreeSlug(
  //   slug,
  //   async (e) => await db.candidatePool.findFirst({ where: { slug: e } })
  // )

  const candidatePool = await db.candidatePool.create({
    data: {
      name: name,
      slug,
      companyId: parentCompanyId ? null : ctx.session.companyId || "0",
      parentCompanyId: parentCompanyId || null,
      createdById: ctx.session.userId || "0",
    },
  })

  return candidatePool
}

export default createCandidatePool
