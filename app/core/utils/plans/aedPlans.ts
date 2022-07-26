import { Plan, PlanFrequency, PlanName } from "types"

const aedPlans = [
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_AED_YEARLY || "",
    title: "Yearly",
    frequency: PlanFrequency.YEARLY,
    pricePerMonth: 99.99,
    pricePerYear: 1199.88,
    currencySymbol: "د.إ",
  } as Plan,
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_AED_MONTHLY || "",
    title: "Monthly",
    frequency: PlanFrequency.MONTHLY,
    pricePerMonth: 119.99,
    pricePerYear: 1439.88,
    currencySymbol: "د.إ",
  } as Plan,
] as Plan[]

export default aedPlans
