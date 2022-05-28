import { Routes, useMutation, Link } from "blitz"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { AuthForm } from "app/auth/components/AuthForm"
import signup from "app/auth/mutations/signup"
import { Signup } from "app/auth/validations"
import toast from "react-hot-toast"
import { z } from "zod"

type SignupFormProps = {
  onSuccess?: () => void
  companyId?: number
}

export const SignupForm = (props: SignupFormProps) => {
  const [signupMutation] = useMutation(signup)

  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center">
        <h1 className="text-gray-800 text-xl font-medium">Start Your Journey</h1>
        <p className="text-gray-400 text-sm">
          Already have an account?{" "}
          <Link href={Routes.LoginPage()} passHref>
            <a className="text-theme-600 hover:text-theme-900 font-medium">Login</a>
          </Link>
        </p>
      </div>
      <AuthForm
        testid="signupForm"
        submitText="Create Account"
        schema={z.object({
          name: z.string().nonempty({ message: "Required" }),
          email: z.string().email(),
          companyName:
            !props.companyId || props.companyId === 0
              ? z.string().nonempty({ message: "Required" })
              : z.string().optional(),
          companyId: z.number().optional(),
          password: z.string().nonempty({ message: "Required" }),
        })}
        initialValues={{ email: "", password: "" }}
        onSubmit={async (values) => {
          try {
            values["companyId"] = props.companyId || 0
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
        <LabeledTextField
          type="email"
          name="email"
          label="Email"
          placeholder="Enter your email"
          testid="signupEmail"
        />
        {(!props.companyId || props.companyId === 0) && (
          <LabeledTextField
            name="companyName"
            label="Company Name"
            placeholder="This shall appear on job boards"
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
      </AuthForm>
    </div>
  )
}

export default SignupForm
