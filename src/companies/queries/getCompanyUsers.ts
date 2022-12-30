import Guard from "src/guard/ability"
import { checkPlan } from "src/companies/utils/checkPlan"
import { Ctx } from "blitz";
import db, { Company, CompanyUser, Prisma, User } from "db"
import { Plan, SubscriptionObject } from "types"
import Stripe from "stripe"
import { checkSubscription } from "../utils/checkSubscription"

interface GetCompanyUsersInput extends Pick<Prisma.CompanyUserFindManyArgs, "where"> {}

async function getCompanyUsers({ where }: GetCompanyUsersInput, ctx: Ctx) {
  const companyUsers = (await db.companyUser.findMany({
    where,
    include: { company: true, user: true },
  })) as any

  // for (const cu of companyUsers) {
  //   if (cu && cu.company) {
  //     // cu.currentPlan = checkPlan(cu.company)
  //     // cu.subscriptionStatus = await getUserSubscriptionStatus({ companyId: cu?.companyId }, ctx)
  //     cu.subscription = checkSubscription(companyUsers.user)
  //   }
  // }

  // if (!companyUsers) throw new NotFoundError()

  return companyUsers as (CompanyUser & {
    user: User
    company: Company
    subscription: SubscriptionObject | null
  })[]
}

export default getCompanyUsers
