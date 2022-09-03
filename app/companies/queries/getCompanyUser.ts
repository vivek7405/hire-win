import Guard from "app/guard/ability"
import { checkPlan } from "app/companies/utils/checkPlan"
import { Ctx, NotFoundError } from "blitz"
import db, { Company, CompanyUser, Prisma, User } from "db"
import { Plan } from "types"
import getCompanySubscriptionStatus from "./getCompanySubscriptionStatus"
import Stripe from "stripe"

interface GetCompanyUserInput extends Pick<Prisma.CompanyUserFindFirstArgs, "where"> {}

async function getCompanyUser({ where }: GetCompanyUserInput, ctx: Ctx) {
  const companyUser = (await db.companyUser.findFirst({
    where,
    include: { company: true, user: true },
  })) as any

  if (companyUser && companyUser.company) {
    // companyUser.currentPlan = checkPlan(companyUser.company)
    companyUser.subscriptionStatus = await getCompanySubscriptionStatus(
      { companyId: companyUser?.companyId },
      ctx
    )
  }

  // if (!companyUser) throw new NotFoundError()

  return companyUser as CompanyUser & {
    user: User
    company: Company
    subscriptionStatus: Stripe.Subscription.Status | null
  }
}

export default getCompanyUser
