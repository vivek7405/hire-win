import { Plan, PlanFrequency, PlanName } from "types"

const usdPlans = [
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_USD_YEARLY || "",
    title: "Yearly",
    frequency: PlanFrequency.YEARLY,
    pricePerMonth: 59,
    pricePerYear: 708,
    currencySymbol: "$",
  } as Plan,
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_USD_MONTHLY || "",
    title: "Monthly",
    frequency: PlanFrequency.MONTHLY,
    pricePerMonth: 69,
    pricePerYear: 828,
    currencySymbol: "$",
  } as Plan,
] as Plan[]

export default usdPlans
