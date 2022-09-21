import { CandidateSource } from "@prisma/client"
import { AnswerObj } from "app/form-questions/validations"
import { Score } from "app/score-cards/validations"
import { z } from "zod"

export const AttachmentZodObj = z
  .object({
    Key: z.string().optional(),
    Location: z.string().optional(),
  })
  .nullable()

export const Candidate = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string(),
  resume: AttachmentZodObj,
  slug: z.string().optional(),
  answers: z.array(AnswerObj),
  scores: z.array(Score).optional(),
  jobId: z.string().optional(),
  source: z.nativeEnum(CandidateSource),
  stageId: z.string().optional(),
  rejected: z.boolean().optional(),
})
export type CandidateInputType = z.infer<typeof Candidate>
