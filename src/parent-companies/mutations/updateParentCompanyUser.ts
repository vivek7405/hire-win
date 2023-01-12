import { Ctx } from "blitz"
import db, { Prisma } from "db"

import Guard from "src/guard/ability"

type UpdateParentCompanyUserInput = Pick<Prisma.ParentCompanyUserUpdateArgs, "where" | "data">

async function updateParentCompanyUser({ where, data }: UpdateParentCompanyUserInput, ctx: Ctx) {
  ctx.session.$authorize()

  const parentCompanyUser = await db.parentCompanyUser.update({
    where,
    data,
  })

  return parentCompanyUser
}

export default Guard.authorize("access", "parentCompanySettings", updateParentCompanyUser)
