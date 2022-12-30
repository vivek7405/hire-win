import { Ctx } from "blitz"
import db from "db"
import stripe from "src/core/utils/stripe"

type UserSubscriptionInput = {
  userId: string
}
export default async function getUserSubscription({ userId }: UserSubscriptionInput, ctx: Ctx) {
  const user = await db.user.findFirst({
    where: { id: userId || "0" },
  })

  if (!user || !user?.stripeSubscriptionId) return null

  const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)

  return subscription || null

  // const currentPlan = checkPlan(companyUser.company)
  // return currentPlan
}
