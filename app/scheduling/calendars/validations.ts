import * as z from "zod"

const messages = {
  noName: "Please enter a name",
  noUsername: "Please enter a username",
  noPassword: "Please enter a password",
  noLink: "Please enter an identifier for your link",
  noDescription: "Please enter a description",
  noLocation: "Please enter a location",
  shortUsername: "Username has to be at least 2 characters",
  invalidEmail: "Please enter a valid email address",
  shortPassword: "Password must contain at least 10 characters",
  longPassword: "Password cannot contain more than 100 characters",
  invalidUrl: "Please enter a valid url",
  invalidNotificationMinutes: "Please leave this field blank or enter a positive number.",
}

export const AddCalendarInput = z.object({
  type: z.string(),
  name: z.string().min(1, { message: messages.noName }),
  url: z.string().url({ message: messages.invalidUrl }),
  username: z.string().min(1, { message: messages.noUsername }),
  password: z.string().min(1, { message: messages.noPassword }),
})
export type AddCalendarInputType = z.infer<typeof AddCalendarInput>
