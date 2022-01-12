import { z } from "zod"

export const UserObj = z.object({
  avatar: z
    .object({
      Location: z.string().optional(),
      Key: z.string().optional(),
    })
    .nullable(),
  company: z.string().nonempty({ message: "Required" }),
})

export type UserInputType = z.infer<typeof UserObj>

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
