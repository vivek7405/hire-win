import { z } from "zod"

export const InterviewInput = z.object({
  // email: z.string().email({ message: messages.invalidEmail }),
  notificationTime: z
    .number()
    .nonnegative({ message: "Please leave this field blank or enter a positive number." }),
})
export type InterviewInputType = z.infer<typeof InterviewInput>
