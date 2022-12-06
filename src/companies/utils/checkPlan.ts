import { Plan } from "types"
import { Company, User } from "db"
import allPlans from "src/plans/utils/allPlans"

export const checkPlan = (company: Company | null): Plan | null => {
  if (
    !company ||
    !company.stripePriceId ||
    !company.stripeCurrentPeriodEnd ||
    company.stripeCurrentPeriodEnd.getTime() < Date.now()
  ) {
    return null
  } else {
    const plan = allPlans.find((plan) => plan.priceId === company.stripePriceId)
    return plan || null
  }
}
