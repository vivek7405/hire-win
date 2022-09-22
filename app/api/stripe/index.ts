import Stripe from "stripe"
import stripe from "app/core/utils/stripe"
import db from "db"
import moment from "moment"

interface ISession {
  id: string
  customer: string
  metadata: {
    companyId: string
  }
  subscription: string
}

const getRawData = (req): Promise<string> => {
  return new Promise((resolve) => {
    let buffer = ""
    req.on("data", (chunk) => {
      buffer += chunk
    })

    req.on("end", () => {
      resolve(Buffer.from(buffer).toString())
    })
  })
}

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  // const body = await getRawBody(req)
  const body = await getRawData(req)
  let event: Stripe.Event | null

  try {
    event = stripe.webhooks.constructEvent(
      body,
      req.headers["stripe-signature"]!,
      process.env.STRIPE_WEBHOOK!
    )
  } catch (err) {
    res.status(400).send(`${err.message}`)
    return
  }

  const session = event.data?.object as ISession

  if (
    event.type === "checkout.session.completed" ||
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted" ||
    event.type === "customer.subscription.pending_update_applied" ||
    event.type === "customer.subscription.pending_update_expired" ||
    event.type === "customer.subscription.trial_will_end"
  ) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription || session.id)

    await db.company.update({
      where: {
        id: session.metadata.companyId || "0",
      },
      data: {
        stripeCurrentPeriodEnd: moment.unix(subscription.current_period_end)?.utc()?.toDate(),
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: session.customer,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeTrialStart: subscription.trial_start
          ? moment.unix(subscription.trial_start)?.utc()?.toDate()
          : null,
        stripeTrialEnd: subscription.trial_end
          ? moment.unix(subscription.trial_end)?.utc()?.toDate()
          : null,
      },
    })
  }

  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription || session.id)

    await db.company.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        stripePriceId: subscription.items.data[0]?.price.id,
      },
    })
  }

  res.json({ received: true })
}

export const config = {
  api: {
    bodyParser: false,
  },
}
