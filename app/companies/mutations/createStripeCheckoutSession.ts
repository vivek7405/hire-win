import { Ctx } from "blitz"
import db from "db"
import stripe from "app/core/utils/stripe"
import { Plan } from "types"

interface CreateStripeCheckoutSessionInput {
  companyId: number
  priceId: string
  quantity: number
}

async function createStripeCheckoutSession(
  { companyId, priceId, quantity }: CreateStripeCheckoutSessionInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const company = await db.company.findFirst({
    where: {
      id: companyId,
    },
  })

  if (!company || ctx.session.companyId !== company?.id || !priceId) return null

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
      companyId,
    },
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  })

  return session?.id
}

export default createStripeCheckoutSession
