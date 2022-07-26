import { Plan, PlanFrequency, PlanName } from "types"

const audPlans = [
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_AUD_YEARLY || "",
    title: "Yearly",
    frequency: PlanFrequency.YEARLY,
    pricePerMonth: 39.99,
    pricePerYear: 479.88,
    currencySymbol: "$",
  } as Plan,
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_AUD_MONTHLY || "",
    title: "Monthly",
    frequency: PlanFrequency.MONTHLY,
    pricePerMonth: 44.99,
    pricePerYear: 539.88,
    currencySymbol: "$",
  } as Plan,
] as Plan[]

export default audPlans
