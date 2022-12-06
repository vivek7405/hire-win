import { z } from "zod"

export const UserObj = z.object({
  // logo: z
  //   .object({
  //     location: z.string().optional(),
  //     key: z.string().optional(),
  //   })
  //   .nullable(),
  name: z.string().nonempty({ message: "Required" }),
  email: z.string().email({ message: "Not valid" }).nonempty({ message: "Required" }),
  // companyName: z.string().nonempty({ message: "Required" }),
  // companyInfo: z.any().optional(),
  // website: z.string().url().optional(),
  // theme: z.string().optional(),
  // stripeSubscriptionId: z.string().optional(),
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
