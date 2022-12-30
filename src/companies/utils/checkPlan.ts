import { Plan } from "types"
import { Company, User } from "db"
import allPlans from "src/plans/utils/allPlans"

export const checkPlan = (user: User | null): Plan | null => {
  if (
    !user ||
    !user.stripePriceId ||
    !user.stripeCurrentPeriodEnd ||
    user.stripeCurrentPeriodEnd.getTime() < Date.now()
  ) {
    return null
  } else {
    const plan = allPlans.find((plan) => plan.priceId === user.stripePriceId)
    return plan || null
  }
}
