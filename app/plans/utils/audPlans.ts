import { Plan, PlanFrequency, PlanName } from "types"

const audPlans = [
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_AUD_YEARLY || "",
    title: "Yearly",
    frequency: PlanFrequency.YEARLY,
    pricePerMonth: 89,
    pricePerYear: 1068,
    currencySymbol: "$",
  } as Plan,
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_AUD_MONTHLY || "",
    title: "Monthly",
    frequency: PlanFrequency.MONTHLY,
    pricePerMonth: 99,
    pricePerYear: 1188,
    currencySymbol: "$",
  } as Plan,
] as Plan[]

export default audPlans
