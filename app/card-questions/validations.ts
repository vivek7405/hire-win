import { z } from "zod"

export const CardQuestion = z.object({
  id: z.string().optional(),
  name: z.string().nonempty({ message: "Name can't be empty" }),
  slug: z.string().optional(),
  scoreCardId: z.string().optional(),
  factory: z.boolean().optional(),
})
export type CardQuestionInputType = z.infer<typeof CardQuestion>
