import { CandidateSource } from "@prisma/client"
import { AnswerObj } from "app/form-questions/validations"
import { Score } from "app/score-cards/validations"
import { z } from "zod"

export const AttachmentZodObj = z
  .object({
    name: z.string().optional(),
    key: z.string().optional(),
    location: z.string().optional(),
  })
  .nullable()
  .optional()

export const CandidateFileObj = z.object({
  id: z.string().optional(),
  attachment: AttachmentZodObj,
  candidateId: z.string().optional(),
})
export type CandidateFileInputType = z.infer<typeof CandidateFileObj>

export const CandidateUserNoteObj = z.object({
  id: z.string().optional(),
  candidateId: z.string().optional(),
  userId: z.string().optional(),
  // note: z.any(),
  note: z.string().optional(),
})
export type CandidateUserNoteInputType = z.infer<typeof CandidateUserNoteObj>

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
  files: z.array(CandidateFileObj).optional(),
  createdById: z.string().optional(),
})
export type CandidateInputType = z.infer<typeof Candidate>
