import { Ctx } from "blitz"
import db from "db"
import stripe from "src/core/utils/stripe"
import Stripe from "stripe"

interface CreateStripeCheckoutSessionInput {
  userId: string
  priceId: string
  quantity: number
}

async function createStripeCheckoutSession(
  { userId, priceId, quantity }: CreateStripeCheckoutSessionInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const user = await db.user.findFirst({
    where: {
      id: userId,
    },
  })

  if (!user || ctx.session.userId !== user?.id || !priceId) return null

  let stripeSubscriptionObject = {
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: quantity,
      },
    ],
    metadata: {
      userId,
    },
    billing_address_collection: "auto",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?recruiterSubscribed=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  } as Stripe.Checkout.SessionCreateParams

  if (user?.stripeCustomerId) {
    stripeSubscriptionObject["customer"] = user?.stripeCustomerId
  } else {
    stripeSubscriptionObject["customer_email"] = user?.email
  }

  // Promotion codes & discounts can't be applied together
  // Provide discounts to referred users else allow applying promotion codes
  if (user?.referredByAffiliateId) {
    stripeSubscriptionObject["discounts"] = [
      {
        coupon: process.env.REFERRAL_DISCOUNT_COUPON_ID || undefined,
      },
    ]
  } else {
    stripeSubscriptionObject["allow_promotion_codes"] = true
  }

  const session = await stripe.checkout.sessions.create(stripeSubscriptionObject)

  return session?.id
}

export default createStripeCheckoutSession
