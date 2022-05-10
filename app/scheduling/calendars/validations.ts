import * as z from "zod"
import { messages } from "../constants"

export const AddCalendarInput = z.object({
  type: z.string(),
  name: z.string().min(1, { message: messages.noName }),
  url: z.string().url({ message: messages.invalidUrl }),
  username: z.string().min(1, { message: messages.noUsername }),
  password: z.string().min(1, { message: messages.noPassword }),
})
export type AddCalendarInputType = z.infer<typeof AddCalendarInput>
