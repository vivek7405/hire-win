import { z } from "zod"

export const CandidatePoolObj = z.object({
  id: z.string().optional(),
  name: z.string().nonempty({ message: "Can't be empty" }),
  slug: z.string().optional(),
  parentCompanyId: z.string().optional(),
})

export type CandidatePoolInputType = z.infer<typeof CandidatePoolObj>
