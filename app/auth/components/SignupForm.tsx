import { Routes, useMutation, Link } from "blitz"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { AuthForm } from "app/auth/components/AuthForm"
import signup from "app/auth/mutations/signup"
import { Signup } from "app/auth/validations"
import toast from "react-hot-toast"

type SignupFormProps = {
  onSuccess?: () => void
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
            <a className="text-indigo-600 hover:text-indigo-900 font-medium">Login</a>
          </Link>
        </p>
      </div>
      <AuthForm
        testid="signupForm"
        submitText="Create Account"
        schema={Signup}
        initialValues={{ email: "", password: "" }}
        onSubmit={async (values) => {
          try {
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
          type="email"
          name="email"
          label="Email"
          placeholder="Email"
          testid="signupEmail"
        />
        <LabeledTextField
          name="company"
          label="Company Name"
          placeholder="This shall appear on job board"
          testid="signupCompany"
        />
        <LabeledTextField
          name="password"
          label="Password"
          placeholder="Password"
          type="password"
          testid="signupPassword"
        />
      </AuthForm>
    </div>
  )
}

export default SignupForm
