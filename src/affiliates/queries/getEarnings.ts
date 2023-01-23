import { resolver } from "@blitzjs/rpc"
import Guard from "src/guard/ability"
import { Ctx, NotFoundError } from "blitz"
import { closestIndexTo } from "date-fns"
import db, { Prisma } from "db"
import stripe from "src/core/utils/stripe"
import CC from "currency-converter-lt"
// const CC = require('currency-converter-lt')

type GetEarningsInput = {
  affiliateId: string

  // Don't calculate these invoices
  invoiceIdsNotToCalculate: string[]

  // If null, calculate all invoices apart from the ones in invoiceIdsNotToCalculate
  invoiceIdsToCalculate: string[] | null
}
const getEarnings = async (
  { affiliateId, invoiceIdsNotToCalculate, invoiceIdsToCalculate }: GetEarningsInput,
  ctx: Ctx
) => {
  const affiliate = await db.affiliate.findFirst({
    where: { id: affiliateId },
    include: { referredUsers: true },
  })

  let totalEarnings = 0
  for (const user of affiliate?.referredUsers || []) {
    if (user?.stripeCustomerId) {
      const invoices = (await stripe.invoices.list({ customer: user?.stripeCustomerId }))?.data
      for (const invoice of invoices || []) {
        if (invoiceIdsNotToCalculate?.includes(invoice.id)) {
          continue
        }
        if (invoiceIdsToCalculate && !invoiceIdsToCalculate?.includes(invoice.id)) {
          continue
        }
        // let totalDiscount = 0
        // for (const discountObj of invoice?.total_discount_amounts || []) {
        //   totalDiscount += discountObj?.amount / 100
        // }
        const invoiceAmountAfterDiscount = invoice.total / 100
        // const invoiceAmountAfterDiscount = invoiceTotal - totalDiscount
        const refundsAmount = invoice?.post_payment_credit_notes_amount / 100
        const finalAmount = invoiceAmountAfterDiscount - refundsAmount
        if (invoice.currency === "inr") {
          // deduct tax
          totalEarnings += (finalAmount - finalAmount * 0.1524) / 2
        } else {
          let currencyConverter = new CC({
            from: invoice.currency?.toUpperCase(),
            to: "INR",
            amount: finalAmount,
          })
          const inrFinalAmount = await currencyConverter.convert()
          totalEarnings += inrFinalAmount
        }
      }
    }
  }

  return Math.floor(totalEarnings)
}

export default getEarnings
