import { z } from "zod"

export const CompanyObj = z.object({
  logo: z
    .object({
      Location: z.string().optional(),
      Key: z.string().optional(),
    })
    .nullable(),
  name: z.string().nonempty({ message: "Required" }),
  info: z.any().optional(),
  website: z.string().url().optional(),
  theme: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
})

export type CompanyInputType = z.infer<typeof CompanyObj>
