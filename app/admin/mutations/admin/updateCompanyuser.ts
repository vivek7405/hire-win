import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateCompanyuserInput = Pick<Prisma.CompanyUserUpdateArgs, "where" | "data">

async function updateCompanyuser({ where, data }: UpdateCompanyuserInput, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const companyuser = await db.companyUser.update({
    where,
    data,
  })

  return companyuser
}

export default updateCompanyuser
