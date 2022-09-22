import { z } from "zod"
import { Behaviour } from "@prisma/client"

export const ScoreCardQuestionObj = z.object({
  id: z.string().optional(),
  name: z.string().nonempty({ message: "Name can't be empty" }),
  slug: z.string().optional(),
  stageId: z.string().optional(),
  allowEdit: z.boolean().optional(),
  order: z.number().optional(),
  behaviour: z.nativeEnum(Behaviour).optional(),
  allowBehaviourEdit: z.boolean().optional(),
})
export type ScoreCardQuestionInputType = z.infer<typeof ScoreCardQuestionObj>

export const ScoreCardQuestions = z.array(ScoreCardQuestionObj)

export const Score = z.object({
  id: z.string().nullable().optional(),
  rating: z.number(),
  note: z.string().nullable().optional(),
  scoreCardQuestionId: z.string(),
  stageId: z.string(),
})
export type ScoreInputType = z.infer<typeof Score>
