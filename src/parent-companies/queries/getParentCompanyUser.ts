import Guard from "src/guard/ability"
import { checkPlan } from "src/companies/utils/checkPlan"
import { Ctx } from "blitz"
import db, { ParentCompany, ParentCompanyUser, Prisma, User } from "db"
import { Plan, SubscriptionObject } from "types"
import Stripe from "stripe"

interface GetParentCompanyUserInput extends Pick<Prisma.ParentCompanyUserFindFirstArgs, "where"> {}

async function getParentCompanyUser({ where }: GetParentCompanyUserInput, ctx: Ctx) {
  const parentCompanyUser = await db.parentCompanyUser.findFirst({
    where,
    include: { parentCompany: true, user: true },
  })

  return parentCompanyUser
}

export default getParentCompanyUser
