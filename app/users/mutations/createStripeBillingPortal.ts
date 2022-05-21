import { Ctx } from "blitz"
import db from "db"
import stripe from "app/core/utils/stripe"

interface CreateStripeBillingPortalInput {
  companyId: number
}

async function createStripeBillingPortal({ companyId }: CreateStripeBillingPortalInput, ctx: Ctx) {
  ctx.session.$authorize()

  const company = await db.company.findFirst({
    where: {
      id: companyId,
    },
  })

  if (!company || !company.stripeCustomerId) return null

  const { url } = await stripe.billingPortal.sessions.create({
    customer: company.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  })

  return url
}

export default createStripeBillingPortal
