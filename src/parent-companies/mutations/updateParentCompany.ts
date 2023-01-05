import { Ctx } from "blitz"
import db, { Prisma, ParentCompany } from "db"
import { ParentCompanyObj } from "src/parent-companies/validations"
import Guard from "src/guard/ability"

type UpdateParentCompanyInput = Pick<Prisma.ParentCompanyUpdateArgs, "where" | "data"> & {
  initial: ParentCompany
}

async function updateParentCompany({ where, data, initial }: UpdateParentCompanyInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { name, email } = ParentCompanyObj.parse(data) as any

  const parentCompany = await db.parentCompany.update({
    where,
    data: { name },
  })

  return parentCompany
}
export default Guard.authorize("access", "parentCompanySettings", updateParentCompany)
