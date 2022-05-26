import { Plan } from "types"
import { Company, User } from "db"
import { plans } from "app/core/utils/plans"

export const checkPlan = (company: Company | null): Plan | null => {
  if (
    !company ||
    !company.stripePriceId ||
    !company.stripeCurrentPeriodEnd ||
    company.stripeCurrentPeriodEnd.getTime() < Date.now()
  ) {
    return null
  } else {
    const plan = plans.find((plan) => plan.priceId === company.stripePriceId)
    return plan || null
  }
}
