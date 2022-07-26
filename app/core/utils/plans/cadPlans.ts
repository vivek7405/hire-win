import { Plan, PlanFrequency, PlanName } from "types"

const cadPlans = [
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_CAD_YEARLY || "",
    title: "Yearly",
    frequency: PlanFrequency.YEARLY,
    pricePerMonth: 34.99,
    pricePerYear: 419.88,
    currencySymbol: "$",
  } as Plan,
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_CAD_MONTHLY || "",
    title: "Monthly",
    frequency: PlanFrequency.MONTHLY,
    pricePerMonth: 39.99,
    pricePerYear: 479.88,
    currencySymbol: "$",
  } as Plan,
] as Plan[]

export default cadPlans
