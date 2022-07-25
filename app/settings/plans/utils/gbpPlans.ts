import { Plan, PlanFrequency, PlanName } from "types"

const gbpPlans = [
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_GBP_YEARLY || "",
    title: "Pro Plan Yearly",
    frequency: PlanFrequency.YEARLY,
    pricePerMonth: 20.99,
    pricePerYear: 251.88,
    currencySymbol: "£",
  } as Plan,
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_GBP_MONTHLY || "",
    title: "Pro Plan Monthly",
    frequency: PlanFrequency.MONTHLY,
    pricePerMonth: 24.99,
    pricePerYear: 299.88,
    currencySymbol: "£",
  } as Plan,
] as Plan[]

export default gbpPlans
