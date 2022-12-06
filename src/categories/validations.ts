import { z } from "zod"

export const CategoryObj = z.object({
  id: z.string().optional(),
  name: z.string().nonempty({ message: "Name can't be empty" }),
  slug: z.string().optional(),
})

export type CategoryInputType = z.infer<typeof CategoryObj>
