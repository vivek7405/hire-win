import { Ctx } from "blitz"
import db, { CompanyUserRole, Prisma, Stage } from "db"
import { StageObj } from "src/stages/validations"
import slugify from "slugify"
import Guard from "src/guard/ability"
import { ExtendedStage } from "types"
import { findFreeSlug } from "src/core/utils/findFreeSlug"
import { z } from "zod"

type UpdateCompanyUserRoleInput = Pick<Prisma.TokenUpdateArgs, "where" | "data">

async function updateCompanyUserRoleInToken({ where, data }: UpdateCompanyUserRoleInput, ctx: Ctx) {
  ctx.session.$authorize()

  const { companyUserRole } = z
    .object({ companyUserRole: z.nativeEnum(CompanyUserRole) })
    .parse(data)

  const token = await db.token.update({
    where,
    data: {
      companyUserRole,
    },
  })

  return token
}

export default updateCompanyUserRoleInToken
