import { Plan, PlanFrequency, PlanName } from "types"

const inrPlans = [
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_INR_YEARLY || "",
    title: "Pro Plan Yearly",
    frequency: PlanFrequency.YEARLY,
    pricePerMonth: 1999,
    pricePerYear: 23988,
    currencySymbol: "₹",
  } as Plan,
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_INR_MONTHLY || "",
    title: "Pro Plan Monthly",
    frequency: PlanFrequency.MONTHLY,
    pricePerMonth: 2299,
    pricePerYear: 27588,
    currencySymbol: "₹",
  } as Plan,
] as Plan[]

export default inrPlans
