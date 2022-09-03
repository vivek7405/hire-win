import { Ctx } from "blitz"
import db from "db"
import stripe from "app/core/utils/stripe"
import getCompanySubscription from "./getCompanySubscription"

type CompanySubscriptionStatusInput = {
  companyId: string
}
export default async function getCompanySubscriptionStatus(
  { companyId }: CompanySubscriptionStatusInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  // const company = await db.company.findFirst({
  //   where: { id: companyId || "0" },
  // })

  // if (!company || !company?.stripeSubscriptionId) return null

  // const subscription = await stripe.subscriptions.retrieve(company.stripeSubscriptionId)
  const subscription = await getCompanySubscription({ companyId }, ctx)
  return subscription?.status || null

  // const currentPlan = checkPlan(companyUser.company)
  // return currentPlan
}
