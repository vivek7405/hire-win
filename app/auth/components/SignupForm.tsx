import { Routes, useMutation, Link } from "blitz"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { AuthForm } from "app/auth/components/AuthForm"
import signup from "app/auth/mutations/signup"
import { Signup } from "app/auth/validations"
import toast from "react-hot-toast"
import { z } from "zod"

type SignupFormProps = {
  onSuccess?: () => void
  companyId?: string | null | undefined
  email?: string | null | undefined
}

export const SignupForm = (props: SignupFormProps) => {
  const [signupMutation] = useMutation(signup)

  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center">
        <h1 className="text-gray-800 text-xl font-medium">Start Your Journey</h1>
        <p className="text-gray-500">
          Already have an account?{" "}
          <Link prefetch={true} href={Routes.LoginPage()} passHref>
            <a className="text-theme-600 hover:text-theme-900 font-medium">Login</a>
          </Link>
        </p>
      </div>
      <AuthForm
        testid="signupForm"
        submitText="Create Account"
        schema={z.object({
          name: z.string().nonempty({ message: "Required" }),
          email:
            !props.email || props.email === ""
              ? z.string().email().nonempty({ message: "Required" })
              : z.string().optional(),
          companyName:
            !props.companyId || props.companyId === "0"
              ? z.string().nonempty({ message: "Required" })
              : z.string().optional(),
          companyId: z.string().optional(),
          password: z.string().nonempty({ message: "Required" }),
        })}
        initialValues={{ email: "", password: "" }}
        onSubmit={async (values) => {
          try {
            values["companyId"] = props.companyId || "0"
            values["email"] = props.email || ""
            values["timezone"] = Intl?.DateTimeFormat()
              ?.resolvedOptions()
              ?.timeZone?.replace("Calcutta", "Kolkata")
            await signupMutation(values)
            props.onSuccess?.()
          } catch (error) {
            if (error.code === "P2002" && error.meta?.target?.includes("email")) {
              // This error comes from Prisma
              toast.error("This email is already being used")
            } else {
              toast.error(error.toString())
            }
          }
        }}
      >
        <LabeledTextField
          name="name"
          label="Name"
          placeholder="Enter your name"
          testid="signupName"
        />
        {(!props.email || props.email === "") && (
          <LabeledTextField
            type="email"
            name="email"
            label="Email"
            placeholder="Enter your email"
            testid="signupEmail"
          />
        )}
        {(!props.companyId || props.companyId === "0") && (
          <LabeledTextField
            name="companyName"
            label="Company Name"
            placeholder="This shall appear on careers page"
            testid="signupCompanyName"
          />
        )}
        <LabeledTextField
          name="password"
          label="Password"
          placeholder="Enter a password for your account"
          type="password"
          testid="signupPassword"
        />
        <div>
          <label className="text-xs text-neutral-500">
            By signing up, you agree to the{" "}
            <Link href={Routes.Terms()}>
              <a target="_blank" className="text-indigo-600 underline">
                Terms of Service
              </a>
            </Link>{" "}
            and{" "}
            <Link href={Routes.Privacy()}>
              <a target="_blank" className="text-indigo-600 underline">
                Privacy Policy
              </a>
            </Link>
            , including{" "}
            <Link href={Routes.Cookies()}>
              <a target="_blank" className="text-indigo-600 underline">
                Cookie Use
              </a>
            </Link>
            .
          </label>
        </div>
      </AuthForm>
    </div>
  )
}

export default SignupForm
