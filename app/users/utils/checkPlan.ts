import { Plan } from "types"
import { User } from "db"
import { plans } from "app/core/utils/plans"

export const checkPlan = (user: User | null): Plan | null => {
  if (
    !user ||
    !user.stripePriceId ||
    !user.stripeCurrentPeriodEnd ||
    user.stripeCurrentPeriodEnd.getTime() < Date.now()
  ) {
    return null
  } else {
    const plan = plans.find((plan) => plan.priceId === user.stripePriceId)
    return plan || null
  }
}
