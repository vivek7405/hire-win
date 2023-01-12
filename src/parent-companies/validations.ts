import { z } from "zod"

export const ParentCompanyObj = z.object({
  name: z.string().nonempty({ message: "Required" }),
})

export type ParentCompanyInputType = z.infer<typeof ParentCompanyObj>
