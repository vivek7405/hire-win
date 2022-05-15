import { z } from "zod"

export const EmailObj = z.object({
  id: z.string().optional(),
  subject: z.string().nonempty({ message: "Can't be empty" }),
  cc: z.string(),
  slug: z.string().optional(),
  body: z.any(),
  candidateId: z.string().optional(),
  workflowStageId: z.string().optional(),
  senderId: z.string().optional(),
  templateId: z.string().optional(),
})

export type EmailInputType = z.infer<typeof EmailObj>
