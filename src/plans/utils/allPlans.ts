import { Plan, PlanFrequency, PlanName } from "types"

const allPlans = [
  {
    name: PlanName.RECRUITER,
    priceId: process.env.RECRUITER_PLAN || "",
    title: "Recruiter Plan",
    frequency: PlanFrequency.MONTHLY,
    pricePerMonth: 29,
    currencySymbol: "USD $",
  } as Plan,
]

export default allPlans
