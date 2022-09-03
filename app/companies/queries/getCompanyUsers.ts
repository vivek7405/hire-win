import Guard from "app/guard/ability"
import { checkPlan } from "app/companies/utils/checkPlan"
import { Ctx, NotFoundError } from "blitz"
import db, { Company, CompanyUser, Prisma, User } from "db"
import { Plan } from "types"
import getCompanySubscriptionStatus from "./getCompanySubscriptionStatus"
import Stripe from "stripe"

interface GetCompanyUsersInput extends Pick<Prisma.CompanyUserFindManyArgs, "where"> {}

async function getCompanyUsers({ where }: GetCompanyUsersInput, ctx: Ctx) {
  const companyUsers = (await db.companyUser.findMany({
    where,
    include: { company: true, user: true },
  })) as any

  for (const cu of companyUsers) {
    if (cu && cu.company) {
      // cu.currentPlan = checkPlan(cu.company)
      cu.subscriptionStatus = await getCompanySubscriptionStatus({ companyId: cu?.companyId }, ctx)
    }
  }

  // if (!companyUsers) throw new NotFoundError()

  return companyUsers as (CompanyUser & {
    user: User
    company: Company
    subscriptionStatus: Stripe.Subscription.Status | null
  })[]
}

export default getCompanyUsers
