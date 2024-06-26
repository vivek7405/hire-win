import { z } from "zod"

export const StageObj = z.object({
  id: z.string().optional(),
  name: z.string().nonempty({ message: "Name can't be empty" }),
  slug: z.string().optional(),
  order: z.number().optional(),
  jobId: z.string().optional(),
  interviewerId: z.string().optional(),
  duration: z.string().optional(),
  allowEdit: z.boolean().optional(),
})

export type StageInputType = z.infer<typeof StageObj>
