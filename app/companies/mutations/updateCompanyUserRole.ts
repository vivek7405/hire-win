import { Ctx } from "blitz"
import db, { Prisma } from "db"

import Guard from "app/guard/ability"

type UpdateCompanyUserInput = Pick<Prisma.CompanyUserUpdateArgs, "where" | "data">

async function updateCompanyUserRole({ where, data }: UpdateCompanyUserInput, ctx: Ctx) {
  ctx.session.$authorize()

  const companyUser = await db.companyUser.update({
    where,
    data,
  })

  return companyUser
}

export default Guard.authorize("update", "companyUser", updateCompanyUserRole)
