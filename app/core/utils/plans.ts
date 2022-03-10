import { Plan, PlanName } from "types"

export const plans: Plan[] = [
  {
    name: PlanName.PRO,
    priceId: process.env.PRO_PLAN || "",
    title: "Pro Plan",
    price: 24.99,
    frequency: "/month",
    description: "The essentials to provide your best work for clients.",
    features: [
      "Unlimited Jobs",
      "Unlimited Applicants",
      "Job Board with Theme Customization",
      "Automatic Job Posting to Google Jobs",
      "Fully Customizable Application Form",
      "Resume Parser",
      "Collaborate with unlimited users per job",
      "Embeddable Job Board Widget",
      // "Applicant Tracking with Kanban Board",
      // "Interview Scheduling",
    ],
  },
]
