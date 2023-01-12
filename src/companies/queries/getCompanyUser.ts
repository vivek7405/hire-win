import Guard from "src/guard/ability"
import { checkPlan } from "src/companies/utils/checkPlan"
import { Ctx } from "blitz"
import db, { Company, CompanyUser, Prisma, User } from "db"
import { Plan, SubscriptionObject } from "types"
import Stripe from "stripe"
import { checkSubscription } from "../utils/checkSubscription"

interface GetCompanyUserInput extends Pick<Prisma.CompanyUserFindFirstArgs, "where"> {}

async function getCompanyUser({ where }: GetCompanyUserInput, ctx: Ctx) {
  const companyUser = await db.companyUser.findFirst({
    where,
    include: { company: true, user: true },
  })

  // if (companyUser && companyUser.company) {
  //   // companyUser.currentPlan = checkPlan(companyUser.company)
  //   // companyUser.subscriptionStatus = await getUserSubscriptionStatus(
  //   //   { companyId: companyUser?.companyId },
  //   //   ctx
  //   // )
  //   companyUser.subscription = checkSubscription(companyUser.user)
  // }

  // if (!companyUser) throw new NotFoundError()

  return companyUser
}

export default getCompanyUser
