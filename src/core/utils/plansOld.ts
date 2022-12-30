import { Plan, PlanFrequency, PlanName } from "types"

export const plansOld: Plan[] = [
  {
    name: PlanName.RECRUITER,
    priceId: process.env.RECRUITER_PLAN || "",
    title: "Recruiter Plan",
    pricePerMonth: 24.99,
    // pricePerYear: 0,
    frequency: PlanFrequency.MONTHLY,
    currencySymbol: "₹",
    // description: "The essentials to provide your best work for clients.",
    // features: [
    //   "Unlimited Jobs",
    //   "Unlimited Applicants",
    //   "Careers Page with Theme Customization",
    //   "Automatic Job Posting to Google Jobs",
    //   "Fully Customizable Application Form",
    //   "Resume Parser",
    //   "Collaborate with unlimited users per job",
    //   "Embeddable Careers Page Widget",
    //   // "Applicant Tracking with Kanban Board",
    //   // "Interview Scheduling",
    // ],
  },
]
