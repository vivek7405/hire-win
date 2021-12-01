import { Plan } from "types"
import { Job } from "db"
import { plans } from "app/core/utils/plans"

export const checkPlan = (job: Job | null): Plan | null => {
  if (
    !job ||
    !job.stripePriceId ||
    !job.stripeCurrentPeriodEnd ||
    job.stripeCurrentPeriodEnd.getTime() < Date.now()
  ) {
    return null
  } else {
    const plan = Object.keys(plans).find(
      (plan) => plans[plan as Plan].priceId === job.stripePriceId
    )
    return (plan as Plan) || null
  }
}
