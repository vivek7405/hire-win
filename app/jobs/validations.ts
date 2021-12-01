import { z } from "zod"

export const Job = z.object({
  name: z.string(),
  slug: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
})

export type JobInputType = z.infer<typeof Job>
