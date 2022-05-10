import { z } from "zod"
import { messages } from "../constants"

export const InterviewInput = z.object({
  // email: z.string().email({ message: messages.invalidEmail }),
  notificationTime: z.number().nonnegative({ message: messages.invalidNotificationMinutes }),
})
export type InterviewInputType = z.infer<typeof InterviewInput>
