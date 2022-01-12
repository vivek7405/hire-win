import { CandidateSource } from "@prisma/client"
import { z } from "zod"

// type Literal = boolean | null | number | string
// type Json = Literal | { [key: string]: Json } | Json[]
// const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()])
// const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
//   z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
// )

export const Job = z.object({
  id: z.string().optional(),
  name: z.string().nonempty({ message: "Name can't be empty" }),
  description: z.any(),
  categoryId: z.string().optional(),
  workflowId: z.string().optional(),
  formId: z.string().optional(),
  slug: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
})
export type JobInputType = z.infer<typeof Job>

export const Answer = z.object({
  id: z.string().optional(),
  value: z.string(),
  questionId: z.string().optional(),
})
export type AnswerInputType = z.infer<typeof Answer>

export const Candidate = z.object({
  id: z.string().optional(),
  answers: z.array(Answer),
  jobId: z.string().optional(),
  source: z.nativeEnum(CandidateSource),
})
export type CandidateInputType = z.infer<typeof Candidate>
