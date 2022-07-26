import { Plan, PlanFrequency, PlanName } from "types"

const usdPlans = [
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_USD_YEARLY || "",
    title: "Yearly",
    frequency: PlanFrequency.YEARLY,
    pricePerMonth: 24.99,
    pricePerYear: 299.88,
    currencySymbol: "$",
  } as Plan,
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_USD_MONTHLY || "",
    title: "Monthly",
    frequency: PlanFrequency.MONTHLY,
    pricePerMonth: 29.99,
    pricePerYear: 359.88,
    currencySymbol: "$",
  } as Plan,
] as Plan[]

export default usdPlans
