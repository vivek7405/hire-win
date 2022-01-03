import { QuestionType } from "@prisma/client"
import { z } from "zod"

export const Question = z.object({
  id: z.string().optional(),
  name: z.string().nonempty({ message: "Name can't be empty" }),
  info: z.string().optional(),
  placeholder: z.string().optional(),
  type: z.nativeEnum(QuestionType),
  required: z.boolean().optional(),
  hidden: z.boolean().optional(),
  slug: z.string().optional(),
  formId: z.string().optional(),
})

export type QuestionInputType = z.infer<typeof Question>
