import { Ctx } from "blitz"
import db, { Prisma, ParentCompany } from "db"
import { ParentCompanyObj } from "src/parent-companies/validations"
import Guard from "src/guard/ability"
import slugify from "slugify"
import { findFreeSlug } from "src/core/utils/findFreeSlug"

type UpdateParentCompanyInput = Pick<Prisma.ParentCompanyUpdateArgs, "where" | "data"> & {
  initial: ParentCompany
}

async function updateParentCompany({ where, data, initial }: UpdateParentCompanyInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { name } = ParentCompanyObj.parse(data) as any

  const slug = slugify(`${name}`, { strict: true, lower: true })
  const newSlug = await findFreeSlug(
    slug,
    async (e) => await db.parentCompany.findFirst({ where: { slug: e } })
  )

  const parentCompany = await db.parentCompany.update({
    where,
    data: {
      name,
      slug: initial.name !== name ? newSlug : initial.slug,
    },
  })

  return parentCompany
}
export default Guard.authorize("access", "parentCompanySettings", updateParentCompany)
