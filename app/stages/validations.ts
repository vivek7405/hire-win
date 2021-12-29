import { z } from "zod"

export const Stage = z.object({
  name: z.string(),
  slug: z.string().optional(),
  order: z.number().optional(),
  workflow: z.string().optional(),
})

export type StageInputType = z.infer<typeof Stage>
