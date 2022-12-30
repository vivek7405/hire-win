import { Ctx } from "blitz"
import db from "db"
import stripe from "src/core/utils/stripe"
import getUserSubscription from "./getUserSubscription"

type UserSubscriptionStatusInput = {
  userId: string
}
export default async function getUserSubscriptionStatus(
  { userId }: UserSubscriptionStatusInput,
  ctx: Ctx
) {
  // const company = await db.company.findFirst({
  //   where: { id: companyId || "0" },
  // })

  // if (!company || !company?.stripeSubscriptionId) return null

  // const subscription = await stripe.subscriptions.retrieve(company.stripeSubscriptionId)
  const subscription = await getUserSubscription({ userId }, ctx)
  return subscription?.status || null

  // const currentPlan = checkPlan(companyUser.company)
  // return currentPlan
}
