import { Plan, PlanFrequency, PlanName } from "types"

const aedPlans = [
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_AED_YEARLY || "",
    title: "Yearly",
    frequency: PlanFrequency.YEARLY,
    pricePerMonth: 229,
    pricePerYear: 2748,
    currencySymbol: "د.إ",
  } as Plan,
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_AED_MONTHLY || "",
    title: "Monthly",
    frequency: PlanFrequency.MONTHLY,
    pricePerMonth: 269,
    pricePerYear: 3228,
    currencySymbol: "د.إ",
  } as Plan,
] as Plan[]

export default aedPlans
