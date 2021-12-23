import { z } from "zod"

export const Category = z.object({
  name: z.string(),
  slug: z.string().optional(),
})

export type CategoryInputType = z.infer<typeof Category>
