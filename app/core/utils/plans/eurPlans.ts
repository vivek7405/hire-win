import { Plan, PlanFrequency, PlanName } from "types"

const eurPlans = [
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_EUR_YEARLY || "",
    title: "Yearly",
    frequency: PlanFrequency.YEARLY,
    pricePerMonth: 24.99,
    pricePerYear: 299.88,
    currencySymbol: "€",
  } as Plan,
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_EUR_MONTHLY || "",
    title: "Monthly",
    frequency: PlanFrequency.MONTHLY,
    pricePerMonth: 29.99,
    pricePerYear: 359.88,
    currencySymbol: "€",
  } as Plan,
] as Plan[]

export default eurPlans
