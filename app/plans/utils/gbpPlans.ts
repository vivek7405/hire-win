import { Plan, PlanFrequency, PlanName } from "types"

const gbpPlans = [
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_GBP_YEARLY || "",
    title: "Yearly",
    frequency: PlanFrequency.YEARLY,
    pricePerMonth: 49,
    pricePerYear: 588,
    currencySymbol: "£",
  } as Plan,
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_GBP_MONTHLY || "",
    title: "Monthly",
    frequency: PlanFrequency.MONTHLY,
    pricePerMonth: 59,
    pricePerYear: 708,
    currencySymbol: "£",
  } as Plan,
] as Plan[]

export default gbpPlans
