import { Behaviour, FormQuestionType } from "@prisma/client"
import { z } from "zod"

export const FormQuestionOptionObj = z.object({
  id: z.string().optional(),
  text: z.string().nonempty({ message: "Question Option can't be empty" }),
  formQuestionId: z.string().optional(),
})
export type FormQuestionOptionInputType = z.infer<typeof FormQuestionOptionObj>

export const FormQuestionObj = z.object({
  id: z.string().optional(),

  jobId: z.string().optional(),
  title: z.string().nonempty({ message: "Title can't be empty" }),
  slug: z.string().optional(),
  order: z.number().optional(),
  allowEdit: z.boolean().optional(),
  behaviour: z.nativeEnum(Behaviour).optional(),
  allowBehaviourEdit: z.boolean().optional(),
  placeholder: z.string().optional(),
  type: z.nativeEnum(FormQuestionType),
  options: z.array(FormQuestionOptionObj).optional(),
  acceptedFiles: z.string().optional(),
})
export type FormQuestionInputType = z.infer<typeof FormQuestionObj>

export const FormQuestionsObj = z.object({
  formId: z.string().optional(),
  questionIds: z.string().array(),
})
export type FormQuestionsInputType = z.infer<typeof FormQuestionsObj>

export const AnswerObj = z.object({
  id: z.string().optional(),
  value: z.string(),
  formQuestionId: z.string().optional(),
})
export type AnswerInputType = z.infer<typeof AnswerObj>
