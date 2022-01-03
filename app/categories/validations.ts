import { z } from "zod"

export const Category = z.object({
  name: z.string().nonempty({ message: "Name can't be empty" }),
  slug: z.string().optional(),
})

export type CategoryInputType = z.infer<typeof Category>
