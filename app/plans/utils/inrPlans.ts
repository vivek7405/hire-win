import { Plan, PlanFrequency, PlanName } from "types"

const inrPlans = [
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_INR_YEARLY || "",
    title: "Yearly",
    frequency: PlanFrequency.YEARLY,
    pricePerMonth: 4999,
    pricePerYear: 59988,
    currencySymbol: "₹",
  } as Plan,
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_INR_MONTHLY || "",
    title: "Monthly",
    frequency: PlanFrequency.MONTHLY,
    pricePerMonth: 5999,
    pricePerYear: 71988,
    currencySymbol: "₹",
  } as Plan,
] as Plan[]

export default inrPlans
