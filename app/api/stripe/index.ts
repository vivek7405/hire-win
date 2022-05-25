import Stripe from "stripe"
import stripe from "app/core/utils/stripe"
import db from "db"

interface ISession {
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

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription)

    await db.company.update({
      where: {
        id: parseInt(session.metadata.companyId || "0"),
      },
      data: {
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: session.customer,
        stripePriceId: subscription.items.data[0]?.price.id,
      },
    })
  }

  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription)

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

  if (event.type === "customer.subscription.trial_will_end") {
    console.log("Trial about to end, make sure your credit card is attached")
  }

  res.json({ received: true })
}

export const config = {
  api: {
    bodyParser: false,
  },
}
