import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateCompanyInput = Pick<Prisma.CompanyUpdateArgs, "where" | "data">

async function updateCompany({ where, data }: UpdateCompanyInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const company = await db.company.update({
    where,
    data,
  })

  return company
}

export default updateCompany
