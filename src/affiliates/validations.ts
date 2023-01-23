import { z } from "zod"

export const AffiliateObj = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  email: z.string().nonempty({ message: "Required" }),
})

export type AffiliateInputType = z.infer<typeof AffiliateObj>
