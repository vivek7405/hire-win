import { z } from "zod"

export const User = z.object({
  avatar: z
    .object({
      Location: z.string().optional(),
      Key: z.string().optional(),
    })
    .nullable(),
})

export type UserInputType = z.infer<typeof User>

export const UserSecurity = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string(),
    confirmNewPassword: z.string(),
  })
  .refine((val) => val.newPassword === val.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  })
