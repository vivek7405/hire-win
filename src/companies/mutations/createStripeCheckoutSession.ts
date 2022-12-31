import { Ctx } from "blitz"
import db from "db"
import stripe from "src/core/utils/stripe"

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

  const session = await stripe.checkout.sessions.create({
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
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?recruiterSubscribed=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  })

  return session?.id
}

export default createStripeCheckoutSession
