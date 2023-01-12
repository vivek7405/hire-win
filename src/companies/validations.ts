import { z } from "zod"

export const CompanyObj = z.object({
  logo: z
    .object({
      location: z.string().optional(),
      key: z.string().optional(),
    })
    .nullable(),
  name: z.string().nonempty({ message: "Required" }),
  // info: z.any().optional(),
  info: z.string().optional(),
  website: z.string().url().or(z.literal("")).optional(),
  theme: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  timezone: z.string().optional(),
  parentCompanyId: z.string().optional(),
  createdById: z.string().optional(),
})

export type CompanyInputType = z.infer<typeof CompanyObj>
