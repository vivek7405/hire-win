import { z } from "zod"

export const EmailTemplateObj = z.object({
  id: z.string().optional(),
  subject: z.string().nonempty({ message: "Can't be empty" }),
  slug: z.string().optional(),
  body: z.any(),
})

export type EmailTemplateInputType = z.infer<typeof EmailTemplateObj>
