import { ScoreCardQuestionBehaviour } from ".prisma1/client"
import { z } from "zod"

export const ScoreCardObj = z.object({
  id: z.string().optional(),
  name: z.string().nonempty({ message: "Name can't be empty" }),
  slug: z.string().optional(),
})
export type ScoreCardInputType = z.infer<typeof ScoreCardObj>

export const ScoreCardQuestion = z.object({
  id: z.string().optional(),
  order: z.number().optional(),
  scoreCardId: z.string().optional(),
  cardQuestionId: z.string().optional(),
  behaviour: z.nativeEnum(ScoreCardQuestionBehaviour).optional(),
  allowBehaviourEdit: z.boolean().optional(),
})
export type ScoreCardQuestionInputType = z.infer<typeof ScoreCardQuestion>

export const ScoreCardQuestions = z.object({
  scoreCardId: z.string().optional(),
  cardQuestionIds: z.string().array(),
})
export type ScoreCardQuestionsInputType = z.infer<typeof ScoreCardQuestions>
