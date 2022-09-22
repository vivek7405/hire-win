import { SubscriptionObject, SubscriptionStatus } from "types"
import { Company } from "db"
import moment from "moment"

export const checkSubscription = (
  company: Company | null | undefined
): SubscriptionObject | null => {
  if (company && company?.stripePriceId) {
    if (
      company.stripeTrialEnd &&
      moment(company.stripeTrialEnd).local().toDate().getTime() > Date.now()
    ) {
      return {
        status: SubscriptionStatus.TRIALING,
        daysLeft: moment(company.stripeTrialEnd).local().fromNow(),
      }
    }

    if (
      company.stripeCurrentPeriodEnd &&
      moment(company.stripeCurrentPeriodEnd).local().toDate().getTime() > Date.now()
    ) {
      return {
        status: SubscriptionStatus.ACTIVE,
        daysLeft: moment(company.stripeCurrentPeriodEnd).local().fromNow(),
      }
    }
  }

  return null
}
