import Link from "next/link"
import { Router, useRouter } from "next/router"
import { useMutation } from "@blitzjs/rpc"
import { Routes } from "@blitzjs/next"
import { LabeledTextField } from "src/core/components/LabeledTextField"
import { AuthForm } from "src/auth/components/AuthForm"
import login from "src/auth/mutations/login"
import { Login } from "src/auth/validations"
import toast from "react-hot-toast"
import { AuthenticationError } from "blitz"

type LoginFormProps = {
  onSuccess?: () => void
}

export const LoginForm = (props: LoginFormProps) => {
  const [loginMutation] = useMutation(login)
  const router = useRouter()

  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center">
        <h1 className="text-gray-800 text-2xl font-medium">Welcome!</h1>
        <p className="text-gray-500">
          Enter your login details to access your account.
          {/* Or{" "}
          <Link legacyBehavior prefetch={true} href={Routes.OldSignupPage()} passHref>
            <a
              className="text-theme-600 hover:text-theme-900 font-medium"
              data-testid={`signupLink`}
            >
              Sign Up
            </a>
          </Link> */}
        </p>
      </div>
      <AuthForm
        testid="loginForm"
        submitText="Login"
        schema={Login}
        initialValues={{ email: "", password: "" }}
        onSubmit={async (values) => {
          try {
            const companyId = await loginMutation(values)
            if (companyId === "0") {
              router.push(Routes.FirstCompany())
            }
            props.onSuccess?.()
          } catch (error) {
            if (error instanceof AuthenticationError) {
              toast.error("Sorry, those credentials are invalid")
            } else {
              toast.error(
                "Sorry, we had an unexpected error. Please try again. - " + error.toString()
              )
            }
          }
        }}
      >
        <LabeledTextField
          type="email"
          name="email"
          label="Email"
          placeholder="Email"
          testid="loginEmail"
        />
        <LabeledTextField
          name="password"
          label="Password"
          placeholder="Password"
          type="password"
          testid="loginPassword"
        />
      </AuthForm>
    </div>
  )
}

export default LoginForm
