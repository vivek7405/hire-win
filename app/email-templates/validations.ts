import { z } from "zod"

export const EmailTemplateObj = z.object({
  id: z.string().optional(),
  name: z.string().nonempty({ message: "Can't be empty" }),
  subject: z.string().nonempty({ message: "Can't be empty" }),
  slug: z.string().optional(),
  body: z.any(),
  userId: z.number().optional(),
})

export type EmailTemplateInputType = z.infer<typeof EmailTemplateObj>
