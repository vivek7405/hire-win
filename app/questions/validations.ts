import { QuestionType } from "@prisma/client"
import { z } from "zod"

export const QuestionOption = z.object({
  id: z.string().optional(),
  text: z.string().nonempty({ message: "Question Option can't be empty" }),
  questionId: z.string().optional(),
})
export type QuestionOptionInputType = z.infer<typeof QuestionOption>

export const Question = z.object({
  id: z.string().optional(),
  name: z.string().nonempty({ message: "Name can't be empty" }),
  placeholder: z.string().optional(),
  type: z.nativeEnum(QuestionType),
  options: z.array(QuestionOption).optional(),
  required: z.boolean().optional(),
  hidden: z.boolean().optional(),
  slug: z.string().optional(),
  formId: z.string().optional(),
  acceptedFiles: z.string().optional(),
})
export type QuestionInputType = z.infer<typeof Question>
