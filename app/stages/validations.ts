import { z } from "zod"

export const Stage = z.object({
  id: z.string().optional(),
  name: z.string().nonempty({ message: "Name can't be empty" }),
  slug: z.string().optional(),
  order: z.number().optional(),
  workflowId: z.string().optional(),
})

export type StageInputType = z.infer<typeof Stage>
