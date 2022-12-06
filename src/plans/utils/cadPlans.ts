import { Plan, PlanFrequency, PlanName } from "types"

const cadPlans = [
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_CAD_YEARLY || "",
    title: "Yearly",
    frequency: PlanFrequency.YEARLY,
    pricePerMonth: 79,
    pricePerYear: 948,
    currencySymbol: "$",
  } as Plan,
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_CAD_MONTHLY || "",
    title: "Monthly",
    frequency: PlanFrequency.MONTHLY,
    pricePerMonth: 89,
    pricePerYear: 1068,
    currencySymbol: "$",
  } as Plan,
] as Plan[]

export default cadPlans
