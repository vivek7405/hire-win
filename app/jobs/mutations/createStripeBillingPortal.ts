import { Ctx } from "blitz"
import db from "db"
import stripe from "app/core/utils/stripe"

interface CreateStripeBillingPortalInput {
  jobId: string
}

async function createStripeBillingPortal({ jobId }: CreateStripeBillingPortalInput, ctx: Ctx) {
  ctx.session.$authorize()

  const job = await db.job.findFirst({
    where: {
      id: jobId,
    },
  })

  if (!job || !job.stripeCustomerId) return null

  const { url } = await stripe.billingPortal.sessions.create({
    customer: job.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/jobs/${job.slug}/settings`,
  })

  return url
}

export default createStripeBillingPortal
