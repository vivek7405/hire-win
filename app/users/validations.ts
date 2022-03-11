import { z } from "zod"

export const UserObj = z.object({
  logo: z
    .object({
      Location: z.string().optional(),
      Key: z.string().optional(),
    })
    .nullable(),
  companyName: z.string().nonempty({ message: "Required" }),
  companyInfo: z.any().optional(),
  website: z.string().url().optional(),
  theme: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
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
