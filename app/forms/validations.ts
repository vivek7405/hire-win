import { z } from "zod"

export const FormObj = z.object({
  name: z.string().nonempty({ message: "Name can't be empty" }),
  slug: z.string().optional(),
})
export type FormInputType = z.infer<typeof FormObj>

export const FormQuestion = z.object({
  id: z.number().optional(),
  order: z.number().optional(),
  formId: z.string().optional(),
  questionId: z.string(),
})
export type FormQuestionInputType = z.infer<typeof FormQuestion>
