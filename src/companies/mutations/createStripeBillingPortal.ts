import { Ctx } from "blitz"
import db from "db"
import stripe from "src/core/utils/stripe"

interface CreateStripeBillingPortalInput {
  userId: string
}

async function createStripeBillingPortal({ userId }: CreateStripeBillingPortalInput, ctx: Ctx) {
  ctx.session.$authorize()

  const user = await db.user.findFirst({
    where: {
      id: userId,
    },
  })

  if (!user || !user.stripeCustomerId) return null

  const { url } = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  })

  return url
}

export default createStripeBillingPortal
