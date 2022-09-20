import { Behaviour } from "@prisma/client"
import { z } from "zod"

export const FormObj = z.object({
  id: z.string().optional(),
  name: z.string().nonempty({ message: "Name can't be empty" }),
  slug: z.string().optional(),
})
export type FormInputType = z.infer<typeof FormObj>

export const FormQuestion = z.object({
  id: z.string().optional(),
  order: z.number().optional(),
  behaviour: z.nativeEnum(Behaviour).optional(),
  allowBehaviourEdit: z.boolean().optional(),
  formId: z.string().optional(),
  questionId: z.string().optional(),
})
export type FormQuestionInputType = z.infer<typeof FormQuestion>

export const FormQuestions = z.object({
  formId: z.string().optional(),
  questionIds: z.string().array(),
})
export type FormQuestionsInputType = z.infer<typeof FormQuestions>
