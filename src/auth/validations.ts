import { z } from "zod"

export const password = z.string().min(8).max(100).nonempty({ message: "Required" })

export const Signup = z.object({
  name: z.string().nonempty({ message: "Required" }),
  email: z.string().email(),
  companyName: z.string().nonempty({ message: "Required" }),
  slug: z.string().optional(),
  companyId: z.string().optional(),
  password: z.string().nonempty({ message: "Required" }),
})

export const Login = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const ForgotPassword = z.object({
  email: z.string().email(),
})

export const ResetPassword = z
  .object({
    password: password,
    passwordConfirmation: password,
    token: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"], // set the path of the error
  })

export const ChangePassword = z.object({
  // made current password optional as it will not be provided
  // when the user has authenticated using Google
  currentPassword: z.string().optional(),
  newPassword: password,
})

export const UserSecurity = z
  .object({
    currentPassword: z.string().nonempty({ message: "Required" }),
    newPassword: password,
    confirmNewPassword: password,
  })
  .refine((val) => val.newPassword === val.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  })

export const UserSecurityWOCurrentPassword = z
  .object({
    newPassword: password,
    confirmNewPassword: password,
  })
  .refine((val) => val.newPassword === val.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  })
