import { Ctx } from "blitz"
import db from "db"
import stripe from "app/core/utils/stripe"

type CompanySubscriptionInput = {
  companyId: string
}
export default async function getCompanySubscription(
  { companyId }: CompanySubscriptionInput,
  ctx: Ctx
) {
  const company = await db.company.findFirst({
    where: { id: companyId || "0" },
  })

  if (!company || !company?.stripeSubscriptionId) return null

  const subscription = await stripe.subscriptions.retrieve(company.stripeSubscriptionId)

  return subscription || null

  // const currentPlan = checkPlan(companyUser.company)
  // return currentPlan
}
