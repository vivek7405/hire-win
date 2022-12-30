import { SubscriptionObject, SubscriptionStatus } from "types"
import { User } from "db"
import moment from "moment"

export const checkSubscription = (user: User | null | undefined): SubscriptionObject | null => {
  if (user && user?.stripePriceId) {
    if (
      user.stripeTrialEnd &&
      moment(user.stripeTrialEnd).local().toDate().getTime() > Date.now()
    ) {
      return {
        status: SubscriptionStatus.TRIALING,
        daysLeft: moment(user.stripeTrialEnd)
          .local()
          .diff(moment({ hours: 0 }), "days"),
      }
    }

    if (
      user.stripeCurrentPeriodEnd &&
      moment(user.stripeCurrentPeriodEnd).local().toDate().getTime() > Date.now()
    ) {
      return {
        status: SubscriptionStatus.ACTIVE,
        daysLeft: moment(user.stripeCurrentPeriodEnd)
          .local()
          .diff(moment({ hours: 0 }), "days"),
      }
    }
  }

  return null
}
