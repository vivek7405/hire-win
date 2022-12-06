import * as z from "zod"

export const AddCalendarInput = z.object({
  type: z.string(),
  name: z.string().min(1, { message: "Please enter a name" }),
  url: z.string().url({ message: "Please enter a valid url" }),
  username: z.string().min(1, { message: "Please enter a username" }),
  password: z.string().min(1, { message: "Please enter a password" }),
})
export type AddCalendarInputType = z.infer<typeof AddCalendarInput>
